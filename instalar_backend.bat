@echo off
echo ========================================
echo  INSTALACAO DO BACKEND - INVENTARIO DE HARDWARE
echo ========================================
echo.

echo [1/3] Verificando arquivos necessarios...
if not exist "db_hardware_schema.sql" (
    echo ERRO: Arquivo db_hardware_schema.sql nao encontrado!
    pause
    exit /b 1
)

if not exist "app_hardware.php" (
    echo ERRO: Arquivo app_hardware.php nao encontrado!
    pause
    exit /b 1
)

echo OK - Todos os arquivos encontrados!
echo.

echo [2/3] Instalando tabelas no banco de dados...
echo.
echo IMPORTANTE: Voce precisara digitar a senha do banco de dados
echo Usuario: faceso56_dashlicencas
echo Banco: faceso56_dashlicencas
echo.

mysql -u faceso56_dashlicencas -p faceso56_dashlicencas < db_hardware_schema.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Falha ao executar o script SQL
    echo.
    echo Alternativa: Use o phpMyAdmin
    echo 1. Acesse phpMyAdmin
    echo 2. Selecione o banco faceso56_dashlicencas
    echo 3. Va em SQL
    echo 4. Cole o conteudo de db_hardware_schema.sql
    echo 5. Clique em Executar
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Verificando instalacao...
echo.

mysql -u faceso56_dashlicencas -p faceso56_dashlicencas -e "SELECT COUNT(*) as total FROM hardware_devices; SELECT COUNT(*) as total FROM storage_devices;"

echo.
echo ========================================
echo  INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Backend instalado e funcionando!
echo.
echo PROXIMO PASSO:
echo - Compile o frontend no projeto de desenvolvimento
echo - Ou aguarde o build para ter a interface completa
echo.
echo Leia o arquivo INSTALACAO_COMPLETA.md para mais detalhes
echo.
pause
