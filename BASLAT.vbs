Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = dir

exeElectron = dir & "\node_modules\electron\dist\electron.exe"
exePortable = dir & "\dist\Hearth-Portable.exe"

If fso.FileExists(exeElectron) Then
  sh.Run """" & exeElectron & """ .", 0, False
ElseIf fso.FileExists(exePortable) Then
  sh.Run """" & exePortable & """", 1, False
Else
  MsgBox "Once BASLAT.bat calistir (npm install) veya npm run pack ile dist olustur.", 16, "Hearth"
End If
