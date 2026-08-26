<?php
/**
 * Classe Helper para API Bitdefender GravityZone
 * Centraliza todas as chamadas à API JSON-RPC 2.0
 * 
 * @version 1.0
 * @date 2026-08-26
 */

class BitdefenderAPI {
    
    private $accessUrl;
    private $apiKey;
    private $timeout = 60;
    private $debug = false;

    /**
     * Construtor
     * 
     * @param string $apiKey API Key do Bitdefender
     * @param string $accessUrl URL de acesso (padrão: GravityZone Cloud)
     * @param bool $debug Ativar logs de debug
     */
    public function __construct($apiKey, $accessUrl = null, $debug = false) {
        $this->apiKey = $apiKey;
        $this->accessUrl = $accessUrl ?: 'https://cloud.gravityzone.bitdefender.com/api';
        $this->debug = $debug;
    }

    /**
     * Definir timeout para requisições
     */
    public function setTimeout($seconds) {
        $this->timeout = $seconds;
    }

    // ============================================================
    // LICENSING - Métodos de licenciamento
    // ============================================================

    /**
     * Obter informações de licença
     * 
     * @return array Informações da licença
     */
    public function getLicenseInfo() {
        return $this->call('licensing', 'getLicenseInfo');
    }

    /**
     * Obter informações de licença da empresa
     * 
     * @return array Informações completas de licenciamento
     */
    public function getCompanyLicenseInfo() {
        return $this->call('licensing', 'getCompanyLicenseInfo');
    }

    // ============================================================
    // NETWORK - Métodos de inventário e gerenciamento de rede
    // ============================================================

    /**
     * Obter inventário de dispositivos da rede
     * 
     * @param array $filters Filtros (opcional)
     * @param int $page Página (padrão: 1)
     * @param int $perPage Itens por página (padrão: 100)
     * @return array Lista de endpoints
     */
    public function getNetworkInventoryItems($filters = [], $page = 1, $perPage = 100) {
        $params = array_merge([
            'page' => $page,
            'perPage' => $perPage
        ], $filters);

        return $this->call('network', 'getNetworkInventoryItems', $params);
    }

    /**
     * Obter detalhes de um endpoint específico
     * 
     * @param string $endpointId ID do endpoint
     * @return array Detalhes do endpoint
     */
    public function getManagedEndpointDetails($endpointId) {
        return $this->call('network', 'getManagedEndpointDetails', [
            'endpointId' => $endpointId
        ]);
    }

    /**
     * Obter lista de grupos
     * 
     * @param string $parentId ID do grupo pai (opcional)
     * @return array Lista de grupos
     */
    public function getGroupsList($parentId = null) {
        $params = $parentId ? ['parentId' => $parentId] : [];
        return $this->call('network', 'getGroupsList', $params);
    }

    /**
     * Isolar endpoint (bloquear comunicação de rede)
     * 
     * @param string $endpointId ID do endpoint
     * @param bool $isolate true para isolar, false para remover isolamento
     * @return array Resultado da operação
     */
    public function setEndpointIsolation($endpointId, $isolate = true) {
        return $this->call('network', 'setEndpointIsolation', [
            'endpointId' => $endpointId,
            'isIsolated' => $isolate
        ]);
    }

    /**
     * Obter status de isolamento do endpoint
     * 
     * @param string $endpointId ID do endpoint
     * @return array Status de isolamento
     */
    public function getEndpointIsolationStatus($endpointId) {
        return $this->call('network', 'getEndpointIsolationStatus', [
            'endpointId' => $endpointId
        ]);
    }

    /**
     * Mover endpoints para um grupo
     * 
     * @param array $endpointIds IDs dos endpoints
     * @param string $groupId ID do grupo de destino
     * @return array Resultado da operação
     */
    public function moveEndpoints($endpointIds, $groupId) {
        return $this->call('network', 'moveEndpoints', [
            'endpointIds' => $endpointIds,
            'groupId' => $groupId
        ]);
    }

    // ============================================================
    // SCANNING - Métodos de varredura
    // ============================================================

    /**
     * Criar tarefa de scan
     * 
     * @param array $targetIds IDs dos endpoints alvo
     * @param string $scanType Tipo: quick, full, custom
     * @param array $options Opções adicionais
     * @return array Resultado com taskId
     */
    public function createScanTask($targetIds, $scanType = 'quick', $options = []) {
        $params = array_merge([
            'targetIds' => $targetIds,
            'type' => $scanType
        ], $options);

        return $this->call('scanning', 'createScanTask', $params);
    }

    /**
     * Criar tarefa de scan por MAC address
     * 
     * @param array $macAddresses Endereços MAC
     * @param string $scanType Tipo: quick, full, custom
     * @param array $options Opções adicionais
     * @return array Resultado com taskId
     */
    public function createScanTaskByMac($macAddresses, $scanType = 'quick', $options = []) {
        $params = array_merge([
            'macAddresses' => $macAddresses,
            'type' => $scanType
        ], $options);

        return $this->call('scanning', 'createScanTaskByMac', $params);
    }

    /**
     * Obter lista de tarefas de scan
     * 
     * @param array $filters Filtros opcionais
     * @return array Lista de tarefas
     */
    public function getScanTasksList($filters = []) {
        return $this->call('scanning', 'getScanTasksList', $filters);
    }

    /**
     * Obter status de uma tarefa
     * 
     * @param string $taskId ID da tarefa
     * @return array Status da tarefa
     */
    public function getTaskStatus($taskId) {
        return $this->call('scanning', 'getTaskStatus', [
            'taskId' => $taskId
        ]);
    }

    /**
     * Deletar tarefa de scan
     * 
     * @param string $taskId ID da tarefa
     * @return array Resultado da operação
     */
    public function deleteScanTask($taskId) {
        return $this->call('scanning', 'deleteScanTask', [
            'taskId' => $taskId
        ]);
    }

    // ============================================================
    // QUARANTINE - Métodos de quarentena
    // ============================================================

    /**
     * Obter lista de itens em quarentena
     * 
     * @param array $filters Filtros opcionais
     * @param int $page Página
     * @param int $perPage Itens por página
     * @return array Lista de itens em quarentena
     */
    public function getQuarantineItemsList($filters = [], $page = 1, $perPage = 100) {
        $params = array_merge([
            'page' => $page,
            'perPage' => $perPage
        ], $filters);

        return $this->call('quarantine', 'getQuarantineItemsList', $params);
    }

    /**
     * Remover item da quarentena
     * 
     * @param string $quarantineItemId ID do item
     * @return array Resultado da operação
     */
    public function removeQuarantineItem($quarantineItemId) {
        return $this->call('quarantine', 'removeQuarantineItem', [
            'quarantineItemId' => $quarantineItemId
        ]);
    }

    /**
     * Restaurar item da quarentena
     * 
     * @param string $quarantineItemId ID do item
     * @return array Resultado da operação
     */
    public function restoreQuarantineItem($quarantineItemId) {
        return $this->call('quarantine', 'restoreQuarantineItem', [
            'quarantineItemId' => $quarantineItemId
        ]);
    }

    // ============================================================
    // INCIDENTS - Métodos de incidentes de segurança
    // ============================================================

    /**
     * Obter lista de incidentes
     * 
     * @param array $filters Filtros opcionais
     * @param int $page Página
     * @param int $perPage Itens por página
     * @return array Lista de incidentes
     */
    public function getIncidentsList($filters = [], $page = 1, $perPage = 100) {
        $params = array_merge([
            'page' => $page,
            'perPage' => $perPage
        ], $filters);

        return $this->call('incidents', 'getIncidentsList', $params);
    }

    /**
     * Obter detalhes de um incidente
     * 
     * @param string $incidentId ID do incidente
     * @return array Detalhes do incidente
     */
    public function getIncidentDetails($incidentId) {
        return $this->call('incidents', 'getIncidentDetails', [
            'incidentId' => $incidentId
        ]);
    }

    /**
     * Atualizar status de incidente
     * 
     * @param string $incidentId ID do incidente
     * @param string $status Novo status
     * @return array Resultado da operação
     */
    public function updateIncidentStatus($incidentId, $status) {
        return $this->call('incidents', 'updateIncidentStatus', [
            'incidentId' => $incidentId,
            'status' => $status
        ]);
    }

    // ============================================================
    // POLICIES - Métodos de políticas de segurança
    // ============================================================

    /**
     * Obter lista de políticas
     * 
     * @return array Lista de políticas
     */
    public function getPoliciesList() {
        return $this->call('policies', 'getPoliciesList');
    }

    /**
     * Obter detalhes de uma política
     * 
     * @param string $policyId ID da política
     * @return array Detalhes da política
     */
    public function getPolicyDetails($policyId) {
        return $this->call('policies', 'getPolicyDetails', [
            'policyId' => $policyId
        ]);
    }

    // ============================================================
    // REPORTING - Métodos de relatórios
    // ============================================================

    /**
     * Criar relatório
     * 
     * @param int $type Tipo do relatório (1-15+)
     * @param array $options Opções do relatório
     * @param array $scheduledInfo Informações de agendamento (opcional)
     * @return array Resultado com reportId
     */
    public function createReport($type, $options = [], $scheduledInfo = null) {
        $params = [
            'type' => $type,
            'options' => $options
        ];

        if ($scheduledInfo) {
            $params['scheduledInfo'] = $scheduledInfo;
        }

        return $this->call('reporting', 'createReport', $params);
    }

    /**
     * Obter lista de relatórios
     * 
     * @param array $filters Filtros opcionais
     * @return array Lista de relatórios
     */
    public function getReportsList($filters = []) {
        return $this->call('reporting', 'getReportsList', $filters);
    }

    /**
     * Obter links de download de relatório
     * 
     * @param string $reportId ID do relatório
     * @return array Links de download
     */
    public function getDownloadLinks($reportId) {
        return $this->call('reporting', 'getDownloadLinks', [
            'reportId' => $reportId
        ]);
    }

    /**
     * Deletar relatório
     * 
     * @param string $reportId ID do relatório
     * @return array Resultado da operação
     */
    public function deleteReport($reportId) {
        return $this->call('reporting', 'deleteReport', [
            'reportId' => $reportId
        ]);
    }

    // ============================================================
    // UPDATES - Métodos de atualização
    // ============================================================

    /**
     * Obter status de atualizações
     * 
     * @param array $endpointIds IDs dos endpoints (opcional)
     * @return array Status de atualizações
     */
    public function getUpdateStatus($endpointIds = []) {
        $params = $endpointIds ? ['endpointIds' => $endpointIds] : [];
        return $this->call('updates', 'getUpdateStatus', $params);
    }

    /**
     * Forçar atualização em endpoints
     * 
     * @param array $endpointIds IDs dos endpoints
     * @return array Resultado da operação
     */
    public function forceUpdate($endpointIds) {
        return $this->call('updates', 'forceUpdate', [
            'endpointIds' => $endpointIds
        ]);
    }

    // ============================================================
    // API GENERAL - Métodos gerais da API
    // ============================================================

    /**
     * Obter detalhes da API Key
     * 
     * @return array Informações da API Key (nome, permissões, etc)
     */
    public function getApiKeyDetails() {
        return $this->call('general', 'getApiKeyDetails');
    }

    // ============================================================
    // MÉTODO GENÉRICO DE CHAMADA
    // ============================================================

    /**
     * Fazer chamada genérica à API Bitdefender
     * 
     * @param string $module Módulo da API (licensing, network, reporting, etc)
     * @param string $method Método a ser chamado
     * @param array $params Parâmetros do método
     * @return array Resultado da API (campo 'result')
     * @throws Exception Em caso de erro
     */
    public function call($module, $method, $params = []) {
        $url = $this->buildUrl($module);

        $payload = [
            'params' => $params,
            'jsonrpc' => '2.0',
            'method' => $method,
            'id' => uniqid('api_', true)
        ];

        if ($this->debug) {
            error_log("=== Bitdefender API Call ===");
            error_log("URL: $url");
            error_log("Module: $module");
            error_log("Method: $method");
            error_log("Payload: " . json_encode($payload, JSON_PRETTY_PRINT));
        }

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($this->apiKey . ':')
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($this->debug) {
            error_log("HTTP Code: $httpCode");
            error_log("Response: " . substr($response, 0, 1000));
        }

        // Tratamento de erros cURL
        if ($curlError) {
            throw new BitdefenderAPIException("Erro cURL: $curlError", 0, $module, $method);
        }

        // Tratamento de erros HTTP
        if ($httpCode === 429) {
            throw new BitdefenderAPIException("Limite de requisições excedido (HTTP 429)", 429, $module, $method);
        }

        if ($httpCode !== 200) {
            throw new BitdefenderAPIException("Erro HTTP $httpCode: $response", $httpCode, $module, $method);
        }

        // Decodificar resposta JSON
        $decoded = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new BitdefenderAPIException("Resposta JSON inválida: " . json_last_error_msg(), 0, $module, $method);
        }

        // Verificar se há erro na resposta da API
        if (isset($decoded['error'])) {
            $errorMsg = $decoded['error']['message'] ?? 'Erro desconhecido';
            $errorCode = $decoded['error']['code'] ?? 0;
            $errorData = $decoded['error']['data'] ?? null;
            
            throw new BitdefenderAPIException(
                "API Error: $errorMsg",
                $errorCode,
                $module,
                $method,
                $errorData
            );
        }

        // Retornar apenas o campo 'result'
        return $decoded['result'] ?? $decoded;
    }

    /**
     * Construir URL da API
     * 
     * @param string $module Módulo da API
     * @return string URL completa
     */
    private function buildUrl($module) {
        $accessUrl = rtrim($this->accessUrl, '/');
        
        // Normalizar URL
        if (!str_ends_with($accessUrl, '/jsonrpc')) {
            if (!str_ends_with($accessUrl, '/api')) {
                $accessUrl .= '/api';
            }
            $accessUrl .= '/v1.0/jsonrpc';
        }
        
        return $accessUrl . '/' . $module;
    }

    /**
     * Criar instância a partir de cliente do banco de dados
     * 
     * @param array $client Registro do cliente com client_api_key e client_access_url
     * @param bool $debug Ativar debug
     * @return BitdefenderAPI
     * @throws Exception Se API Key não configurada
     */
    public static function fromClient($client, $debug = false) {
        if (empty($client['client_api_key'])) {
            throw new Exception("Cliente não possui API Key configurada");
        }

        $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api';
        
        return new self($client['client_api_key'], $accessUrl, $debug);
    }
}

/**
 * Exceção personalizada para erros da API Bitdefender
 */
class BitdefenderAPIException extends Exception {
    
    private $module;
    private $method;
    private $errorData;

    public function __construct($message, $code = 0, $module = null, $method = null, $errorData = null) {
        parent::__construct($message, $code);
        $this->module = $module;
        $this->method = $method;
        $this->errorData = $errorData;
    }

    public function getModule() {
        return $this->module;
    }

    public function getMethod() {
        return $this->method;
    }

    public function getErrorData() {
        return $this->errorData;
    }

    public function toArray() {
        return [
            'error' => $this->getMessage(),
            'code' => $this->getCode(),
            'module' => $this->module,
            'method' => $this->method,
            'data' => $this->errorData
        ];
    }
}

// ============================================================
// FUNÇÕES AUXILIARES GLOBAIS
// ============================================================

/**
 * Criar instância da API Bitdefender para um cliente
 * 
 * @param PDO $pdo Conexão com banco de dados
 * @param int $clientId ID do cliente
 * @param bool $debug Ativar debug
 * @return BitdefenderAPI
 * @throws Exception Se cliente não encontrado ou sem API Key
 */
function getBitdefenderAPI($pdo, $clientId, $debug = false) {
    $stmt = $pdo->prepare("
        SELECT client_api_key, client_access_url 
        FROM bitdefender_licenses 
        WHERE id = ?
    ");
    $stmt->execute([$clientId]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$client) {
        throw new Exception("Cliente não encontrado");
    }

    return BitdefenderAPI::fromClient($client, $debug);
}

/**
 * Testar conexão com API Bitdefender
 * 
 * @param string $apiKey API Key
 * @param string $accessUrl URL de acesso (opcional)
 * @return array Resultado do teste com informações da API Key
 * @throws Exception Em caso de erro
 */
function testBitdefenderConnection($apiKey, $accessUrl = null) {
    try {
        $api = new BitdefenderAPI($apiKey, $accessUrl, true);
        $result = $api->getApiKeyDetails();
        
        return [
            'success' => true,
            'message' => 'Conexão estabelecida com sucesso',
            'data' => $result
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}
