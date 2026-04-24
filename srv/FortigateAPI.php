<?php
/**
 * FortigateAPI - Classe para comunicação com a API REST do FortiGate
 * 
 * Esta classe fornece métodos para interagir com dispositivos FortiGate
 * através da API REST, incluindo busca de status, licenças e configurações.
 */

class FortigateAPI {
    private $host;
    private $port;
    private $token;
    private $verifySsl;
    private $timeout;
    private $baseUrl;

    /**
     * Construtor
     * 
     * @param string $host IP ou hostname do FortiGate
     * @param string $token Token de API
     * @param int $port Porta da API (padrão: 443)
     * @param bool $verifySsl Verificar certificado SSL (padrão: true)
     * @param int $timeout Timeout em segundos (padrão: 30)
     */
    public function __construct($host, $token, $port = 443, $verifySsl = true, $timeout = 30) {
        $this->host = $host;
        $this->port = $port;
        $this->token = $token;
        $this->verifySsl = $verifySsl;
        $this->timeout = $timeout;
        $this->baseUrl = "https://{$host}:{$port}/api/v2";
    }

    /**
     * Faz uma requisição HTTP para a API
     * 
     * @param string $endpoint Endpoint da API (ex: /monitor/system/status)
     * @param string $method Método HTTP (GET, POST, PUT, DELETE)
     * @param array $data Dados para enviar (opcional)
     * @return array Resposta da API
     * @throws Exception Em caso de erro
     */
    private function request($endpoint, $method = 'GET', $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        // Adicionar token na URL
        $separator = strpos($url, '?') !== false ? '&' : '?';
        $url .= $separator . 'access_token=' . $this->token;

        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $this->verifySsl);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, $this->verifySsl ? 2 : 0);
        
        // Configurar método HTTP
        if ($method !== 'GET') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        }
        
        // Adicionar dados se fornecidos
        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Content-Length: ' . strlen(json_encode($data))
            ]);
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        
        curl_close($ch);

        if ($error) {
            throw new Exception("Erro de conexão: {$error}");
        }

        if ($httpCode !== 200) {
            throw new Exception("Erro HTTP {$httpCode}: {$response}");
        }

        $decoded = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Erro ao decodificar JSON: " . json_last_error_msg());
        }

        return $decoded;
    }

    /**
     * Testa a conectividade com o FortiGate
     * 
     * @return array ['success' => bool, 'message' => string, 'data' => array]
     */
    public function testConnection() {
        try {
            $status = $this->getSystemStatus();
            return [
                'success' => true,
                'message' => 'Conexão estabelecida com sucesso',
                'data' => $status
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Busca o status do sistema
     * 
     * @return array Informações do sistema
     */
    public function getSystemStatus() {
        $response = $this->request('/monitor/system/status');
        return $response['results'] ?? $response;
    }

    /**
     * Busca o status das licenças
     * 
     * @return array Informações de licenças
     */
    public function getLicenseStatus() {
        $response = $this->request('/monitor/license/status');
        return $response['results'] ?? $response;
    }

    /**
     * Busca recursos do sistema (CPU, memória, etc)
     * 
     * @return array Informações de recursos
     */
    public function getSystemResources() {
        $response = $this->request('/monitor/system/resource/usage');
        return $response['results'] ?? $response;
    }

    /**
     * Busca informações de performance
     * 
     * @return array Informações de performance
     */
    public function getSystemPerformance() {
        $response = $this->request('/monitor/system/performance/status');
        return $response['results'] ?? $response;
    }

    /**
     * Busca estatísticas de sessões
     * 
     * @return array Estatísticas de sessões
     */
    public function getSessionStats() {
        $response = $this->request('/monitor/system/session/stat');
        return $response['results'] ?? $response;
    }

    /**
     * Busca informações de VPN
     * 
     * @return array Informações de VPN
     */
    public function getVPNStatus() {
        $response = $this->request('/monitor/vpn/ssl');
        return $response['results'] ?? $response;
    }

    /**
     * Busca todas as informações relevantes do dispositivo
     * 
     * @return array Dados completos do dispositivo
     */
    public function getAllDeviceInfo() {
        $data = [];
        
        try {
            $data['system_status'] = $this->getSystemStatus();
        } catch (Exception $e) {
            $data['system_status'] = ['error' => $e->getMessage()];
        }

        try {
            $data['license_status'] = $this->getLicenseStatus();
        } catch (Exception $e) {
            $data['license_status'] = ['error' => $e->getMessage()];
        }

        try {
            $data['system_resources'] = $this->getSystemResources();
        } catch (Exception $e) {
            $data['system_resources'] = ['error' => $e->getMessage()];
        }

        try {
            $data['session_stats'] = $this->getSessionStats();
        } catch (Exception $e) {
            $data['session_stats'] = ['error' => $e->getMessage()];
        }

        return $data;
    }

    /**
     * Converte timestamp epoch para DateTime
     * 
     * @param int $epoch Timestamp em formato epoch
     * @return string Data formatada (Y-m-d H:i:s)
     */
    public static function epochToDateTime($epoch) {
        if (empty($epoch) || $epoch == 0) {
            return null;
        }
        return date('Y-m-d H:i:s', $epoch);
    }

    /**
     * Valida se um IP é válido
     * 
     * @param string $ip Endereço IP
     * @return bool True se válido
     */
    public static function validateIP($ip) {
        return filter_var($ip, FILTER_VALIDATE_IP) !== false;
    }
}
