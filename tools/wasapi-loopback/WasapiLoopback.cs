// Hearth — Windows WASAPI default-render loopback → stereo float32 PCM stdout
// Protocol:
//   Line 1 (ASCII): HEARTH_PCM sampleRate=<n> channels=2 format=f32le bits=32\n
//   Then continuous interleaved stereo float32 little-endian samples.
// Stop: close stdin (or kill process).
//
// Compile:
//   csc /nologo /optimize+ /out:wasapi-loopback.exe WasapiLoopback.cs

using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;

internal static class Program
{
    private const int eRender = 0;
    private const int eConsole = 0;
    private const int AUDCLNT_SHAREMODE_SHARED = 0;
    private const int AUDCLNT_STREAMFLAGS_LOOPBACK = 0x00020000;
    private const int CLSCTX_ALL = 0x17;
    private const uint AUDCLNT_BUFFERFLAGS_SILENT = 0x2;
    private const ushort WAVE_FORMAT_PCM = 1;
    private const ushort WAVE_FORMAT_IEEE_FLOAT = 3;
    private const ushort WAVE_FORMAT_EXTENSIBLE = 0xFFFE;

    [ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
    private class MMDeviceEnumeratorComObject { }

    [Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"),
     InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IMMDeviceEnumerator
    {
        int NotImpl1();
        [PreserveSig]
        int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice endpoint);
    }

    [Guid("D666063F-1587-4E43-81F1-B948E807363F"),
     InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IMMDevice
    {
        [PreserveSig]
        int Activate(ref Guid iid, int dwClsCtx, IntPtr pActivationParams,
            [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface);
    }

    [Guid("1CB9AD4C-DBFA-4c32-B178-C2F568A703B2"),
     InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IAudioClient
    {
        [PreserveSig]
        int Initialize(int ShareMode, int StreamFlags, long hnsBufferDuration,
            long hnsPeriodicity, IntPtr pFormat, IntPtr AudioSessionGuid);
        [PreserveSig]
        int GetBufferSize(out uint pNumBufferFrames);
        [PreserveSig]
        int GetStreamLatency(out long phnsLatency);
        [PreserveSig]
        int GetCurrentPadding(out uint pNumPaddingFrames);
        [PreserveSig]
        int IsFormatSupported(int ShareMode, IntPtr pFormat, out IntPtr ppClosestMatch);
        [PreserveSig]
        int GetMixFormat(out IntPtr ppDeviceFormat);
        [PreserveSig]
        int GetDevicePeriod(out long phnsDefaultDevicePeriod, out long phnsMinimumDevicePeriod);
        [PreserveSig]
        int Start();
        [PreserveSig]
        int Stop();
        [PreserveSig]
        int Reset();
        [PreserveSig]
        int SetEventHandle(IntPtr eventHandle);
        [PreserveSig]
        int GetService(ref Guid riid, [MarshalAs(UnmanagedType.IUnknown)] out object ppv);
    }

    [Guid("C8ADBD64-E71E-48a0-A4DE-185C395CD317"),
     InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IAudioCaptureClient
    {
        [PreserveSig]
        int GetBuffer(out IntPtr ppData, out uint pNumFramesToRead, out uint pdwFlags,
            out ulong pu64DevicePosition, out ulong pu64QPCPosition);
        [PreserveSig]
        int ReleaseBuffer(uint numFramesRead);
        [PreserveSig]
        int GetNextPacketSize(out uint pNumFramesInNextPacket);
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct WAVEFORMATEX
    {
        public ushort wFormatTag;
        public ushort nChannels;
        public uint nSamplesPerSec;
        public uint nAvgBytesPerSec;
        public ushort nBlockAlign;
        public ushort wBitsPerSample;
        public ushort cbSize;
    }

    private static volatile bool _run = true;

    private static int Main()
    {
        Stream stdout = null;
        StreamWriter stderr = null;
        try
        {
            stdout = Console.OpenStandardOutput();
            stderr = new StreamWriter(Console.OpenStandardError()) { AutoFlush = true };

            // Stop when parent closes stdin
            var stopper = new Thread(() =>
            {
                try
                {
                    using (var stdin = Console.OpenStandardInput())
                    {
                        var buf = new byte[32];
                        while (_run)
                        {
                            int n = stdin.Read(buf, 0, buf.Length);
                            if (n <= 0) break;
                        }
                    }
                }
                catch { }
                _run = false;
            })
            { IsBackground = true };
            stopper.Start();

            var enu = (IMMDeviceEnumerator)new MMDeviceEnumeratorComObject();
            IMMDevice device;
            int hr = enu.GetDefaultAudioEndpoint(eRender, eConsole, out device);
            if (hr != 0) { stderr.WriteLine("GetDefaultAudioEndpoint 0x{0:X8}", hr); return 1; }

            Guid iidClient = typeof(IAudioClient).GUID;
            object oClient;
            hr = device.Activate(ref iidClient, CLSCTX_ALL, IntPtr.Zero, out oClient);
            if (hr != 0) { stderr.WriteLine("Activate 0x{0:X8}", hr); return 1; }
            var client = (IAudioClient)oClient;

            IntPtr mixFmtPtr;
            hr = client.GetMixFormat(out mixFmtPtr);
            if (hr != 0) { stderr.WriteLine("GetMixFormat 0x{0:X8}", hr); return 1; }

            var wf = (WAVEFORMATEX)Marshal.PtrToStructure(mixFmtPtr, typeof(WAVEFORMATEX));
            int inCh = wf.nChannels;
            int sampleRate = (int)wf.nSamplesPerSec;
            int bits = wf.wBitsPerSample;
            bool isFloat = DetectFloat(wf, mixFmtPtr);
            if (inCh < 1) inCh = 2;
            if (bits < 8) bits = 32;

            // 200 ms buffer — more tolerant
            long hnsBuffer = 2000000;
            hr = client.Initialize(
                AUDCLNT_SHAREMODE_SHARED,
                AUDCLNT_STREAMFLAGS_LOOPBACK,
                hnsBuffer,
                0,
                mixFmtPtr,
                IntPtr.Zero);
            if (hr != 0) { stderr.WriteLine("Initialize 0x{0:X8}", hr); return 1; }

            long defPeriod, minPeriod;
            client.GetDevicePeriod(out defPeriod, out minPeriod);
            int sleepMs = Math.Max(5, (int)(defPeriod / 10000 / 2)); // half period in ms

            Guid iidCap = typeof(IAudioCaptureClient).GUID;
            object oCap;
            hr = client.GetService(ref iidCap, out oCap);
            if (hr != 0) { stderr.WriteLine("GetService 0x{0:X8}", hr); return 1; }
            var capture = (IAudioCaptureClient)oCap;

            // Always stereo out for WebRTC simplicity
            var header = string.Format(
                "HEARTH_PCM sampleRate={0} channels=2 format=f32le bits=32\n",
                sampleRate);
            var hb = System.Text.Encoding.ASCII.GetBytes(header);
            stdout.Write(hb, 0, hb.Length);
            stdout.Flush();

            hr = client.Start();
            if (hr != 0) { stderr.WriteLine("Start 0x{0:X8}", hr); return 1; }

            var stereoBytes = new byte[0];
            int bytesPerInFrame = (bits / 8) * inCh;

            while (_run)
            {
                uint packet = 0;
                hr = capture.GetNextPacketSize(out packet);
                if (hr != 0) { stderr.WriteLine("GetNextPacketSize 0x{0:X8}", hr); return 2; }

                if (packet == 0)
                {
                    Thread.Sleep(sleepMs);
                    continue;
                }

                while (packet > 0 && _run)
                {
                    IntPtr data;
                    uint frames;
                    uint flags;
                    ulong a, b;
                    hr = capture.GetBuffer(out data, out frames, out flags, out a, out b);
                    if (hr != 0) { stderr.WriteLine("GetBuffer 0x{0:X8}", hr); return 2; }

                    int outBytes = (int)frames * 2 * 4;
                    if (stereoBytes.Length < outBytes)
                        stereoBytes = new byte[outBytes];

                    bool silent = (flags & AUDCLNT_BUFFERFLAGS_SILENT) != 0 || data == IntPtr.Zero;
                    if (silent)
                    {
                        Array.Clear(stereoBytes, 0, outBytes);
                    }
                    else
                    {
                        DownmixToStereo(data, frames, inCh, bits, isFloat, stereoBytes);
                    }

                    capture.ReleaseBuffer(frames);

                    try { stdout.Write(stereoBytes, 0, outBytes); }
                    catch { _run = false; break; }

                    hr = capture.GetNextPacketSize(out packet);
                    if (hr != 0) break;
                }
            }

            try { client.Stop(); } catch { }
            return 0;
        }
        catch (Exception ex)
        {
            try { if (stderr != null) stderr.WriteLine("EX: " + ex); } catch { }
            return 2;
        }
    }

    private static bool DetectFloat(WAVEFORMATEX wf, IntPtr p)
    {
        if (wf.wFormatTag == WAVE_FORMAT_IEEE_FLOAT) return true;
        if (wf.wFormatTag == WAVE_FORMAT_PCM) return false;
        if (wf.wFormatTag == WAVE_FORMAT_EXTENSIBLE)
        {
            // SubFormat GUID at offset 24
            // KSDATAFORMAT_SUBTYPE_IEEE_FLOAT first dword = 3
            // KSDATAFORMAT_SUBTYPE_PCM first dword = 1
            int sub = Marshal.ReadInt32(p, 24);
            return sub == 3;
        }
        return wf.wBitsPerSample == 32;
    }

    private static void DownmixToStereo(IntPtr data, uint frames, int inCh, int bits, bool isFloat, byte[] dest)
    {
        for (uint f = 0; f < frames; f++)
        {
            float L, R;
            if (isFloat && bits == 32)
            {
                // each sample 4 bytes
                if (inCh == 1)
                {
                    L = R = ReadF32(data, (int)(f * inCh) * 4);
                }
                else
                {
                    L = ReadF32(data, (int)(f * inCh + 0) * 4);
                    R = ReadF32(data, (int)(f * inCh + 1) * 4);
                    // fold extra channels into L/R lightly (center/LFE/surround)
                    if (inCh >= 3)
                    {
                        float c = ReadF32(data, (int)(f * inCh + 2) * 4) * 0.5f;
                        L += c; R += c;
                    }
                    if (inCh >= 4)
                    {
                        float lfe = ReadF32(data, (int)(f * inCh + 3) * 4) * 0.35f;
                        L += lfe; R += lfe;
                    }
                    for (int ch = 4; ch < inCh; ch++)
                    {
                        float s = ReadF32(data, (int)(f * inCh + ch) * 4) * 0.35f;
                        if ((ch & 1) == 0) L += s; else R += s;
                    }
                }
            }
            else if (!isFloat && bits == 16)
            {
                if (inCh == 1)
                {
                    L = R = Marshal.ReadInt16(data, (int)(f * inCh) * 2) / 32768f;
                }
                else
                {
                    L = Marshal.ReadInt16(data, (int)(f * inCh + 0) * 2) / 32768f;
                    R = Marshal.ReadInt16(data, (int)(f * inCh + 1) * 2) / 32768f;
                }
            }
            else if (!isFloat && bits == 32)
            {
                if (inCh == 1)
                {
                    L = R = Marshal.ReadInt32(data, (int)(f * inCh) * 4) / 2147483648f;
                }
                else
                {
                    L = Marshal.ReadInt32(data, (int)(f * inCh + 0) * 4) / 2147483648f;
                    R = Marshal.ReadInt32(data, (int)(f * inCh + 1) * 4) / 2147483648f;
                }
            }
            else
            {
                L = R = 0;
            }

            // soft clip
            if (L > 1) L = 1; else if (L < -1) L = -1;
            if (R > 1) R = 1; else if (R < -1) R = -1;

            WriteF32(dest, (int)f * 8, L);
            WriteF32(dest, (int)f * 8 + 4, R);
        }
    }

    private static float ReadF32(IntPtr p, int offset)
    {
        return BitConverter.ToSingle(BitConverter.GetBytes(Marshal.ReadInt32(p, offset)), 0);
    }

    private static void WriteF32(byte[] buf, int offset, float v)
    {
        var b = BitConverter.GetBytes(v);
        buf[offset] = b[0];
        buf[offset + 1] = b[1];
        buf[offset + 2] = b[2];
        buf[offset + 3] = b[3];
    }
}
