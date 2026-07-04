@echo off
title Doraemon Studio - Hex Translator Tool
color 0A

echo ===================================================
echo    DANG KHOI DONG CHUONG TRINH DICH THUAT - DORAEMON STUDIO...
echo    Vui long khong tat cua so nay trong qua trinh bien dich!
echo    Chi dong cua so khi khong con su dung tool.
echo ===================================================

cd backend

:: Kiem tra neu chua co thu muc node_modules thi tu dong cai dat
IF NOT EXIST "node_modules\" (
    echo.
    echo [!] He thong dang tim kiem thu vien.
    echo [!] Dang tu dong tai va cai dat. Vui long doi it phut...
    npm install
    echo [!] Cai dat hoan tat!
    echo.
)

node server.js

pause
