@echo off
chcp 65001 >nul
echo === Pruebas ===
py tests\test_pipeline.py || goto :error
echo === Descarga (Wiktextract + OpenSLR) ===
py scripts\download_sources.py || goto :error
echo === Integridad ===
py scripts\verify_integrity.py
echo === Staging de muestra ===
py scripts\stage_wiktextract.py --stride 10
py scripts\stage_openslr.py
if exist data\raw\mcr30_2016 py scripts\stage_mcr_dump.py
echo === Informe ===
py scripts\sample_report.py
goto :eof
:error
echo Fallo un paso. Copia la salida y pegala en el chat.
