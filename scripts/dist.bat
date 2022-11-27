@echo off

@REM npm run build

rmdir /s /q .\dist\npm\exhibitor\lib\
xcopy .\build\site\server\ .\dist\npm\exhibitor\lib\site\server\ /s /e
xcopy .\build\site\client\ .\dist\npm\exhibitor\lib\site\client\ /s /e
xcopy .\build\api\ .\dist\npm\exhibitor\lib\api\ /s /e
xcopy .\build\cli\cli\ .\dist\npm\exhibitor\lib\cli\ /s /e
