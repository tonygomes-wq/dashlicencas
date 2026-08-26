import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Mail, Save, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportType {
  id: number;
  name: string;
  description: string;
}

interface Schedule {
  id: number;
  schedule_name: string;
  report_type: number;
  report_type_name: string;
  recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly';
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  is_active: boolean;
  next_execution_at: string;
  last_execution_at: string;
  last_execution_status: 'success' | 'failed' | null;
  execution_count: number;
  send_email_notification: boolean;
  notification_emails: string[];
}

interface BitdefenderScheduleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  clientName: string;
  scheduleToEdit?: Schedule | null;
}

const BitdefenderScheduleReportModal: React.FC<BitdefenderScheduleReportModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  scheduleToEdit
}) => {
  const [step, setStep] = useState<'form' | 'list'>('list');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [scheduleName, setScheduleName] = useState('');
  const [reportType, setReportType] = useState<number>(12);
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState(1); // 1 = Monday
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState('08:00');
  const [reportingInterval, setReportingInterval] = useState('lastWeek');
  const [filterType, setFilterType] = useState(0);
  const [detailedExport, setDetailedExport] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [notificationEmails, setNotificationEmails] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchSchedules();
      fetchReportTypes();
      
      if (scheduleToEdit) {
        loadScheduleForEdit(scheduleToEdit);
        setStep('form');
      } else {
        resetForm();
        setStep('list');
      }
    }
  }, [isOpen, scheduleToEdit]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/app_bitdefender_reports.php?action=schedules&client_id=${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar agendamentos');

      const data = await response.json();
      if (data.success) {
        setSchedules(data.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error(error.message || 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportTypes = async () => {
    try {
      const response = await fetch('/app_bitdefender_reports.php?action=types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar tipos');

      const data = await response.json();
      if (data.success) {
        setReportTypes(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos:', error);
    }
  };

  const loadScheduleForEdit = (schedule: Schedule) => {
    setScheduleName(schedule.schedule_name);
    setReportType(schedule.report_type);
    setRecurrence(schedule.recurrence);
    setDayOfWeek(schedule.day_of_week || 1);
    setDayOfMonth(schedule.day_of_month || 1);
    setTimeOfDay(schedule.time_of_day);
    setSendEmail(schedule.send_email_notification);
    setNotificationEmails(schedule.notification_emails?.join(', ') || '');
    setIsActive(schedule.is_active);
  };

  const resetForm = () => {
    setScheduleName('');
    setReportType(12);
    setRecurrence('weekly');
    setDayOfWeek(1);
    setDayOfMonth(1);
    setTimeOfDay('08:00');
    setReportingInterval('lastWeek');
    setFilterType(0);
    setDetailedExport(true);
    setSendEmail(true);
    setNotificationEmails('');
    setIsActive(true);
  };

  const handleSave = async () => {
    if (!scheduleName) {
      toast.error('Digite um nome para o agendamento');
      return;
    }

    setSaving(true);
    try {
      const emailsArray = notificationEmails
        .split(',')
        .map(e => e.trim())
        .filter(e => e);

      const payload = {
        action: 'create_schedule',
        client_id: clientId,
        schedule_name: scheduleName,
        report_type: reportType,
        recurrence: recurrence,
        day_of_week: recurrence === 'weekly' ? dayOfWeek : null,
        day_of_month: recurrence === 'monthly' ? dayOfMonth : null,
        time_of_day: timeOfDay,
        reporting_interval: reportingInterval,
        filter_type: filterType,
        detailed_export: detailedExport,
        send_email_notification: sendEmail,
        notification_emails: emailsArray.length > 0 ? emailsArray : null,
        is_active: isActive
      };

      const response = await fetch('/app_bitdefender_reports.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Erro ao salvar agendamento');

      const data = await response.json();
      if (data.success) {
        toast.success('Agendamento criado com sucesso!');
        resetForm();
        fetchSchedules();
        setStep('list');
      } else {
        throw new Error(data.error || 'Erro ao salvar agendamento');
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.message || 'Erro ao salvar agendamento');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (scheduleId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/app_bitdefender_reports.php?id=${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (!response.ok) throw new Error('Erro ao atualizar agendamento');

      const data = await response.json();
      if (data.success) {
        toast.success(`Agendamento ${!currentStatus ? 'ativado' : 'desativado'}`);
        fetchSchedules();
      }
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      toast.error(error.message || 'Erro ao atualizar agendamento');
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }

    try {
      const response = await fetch(`/app_bitdefender_reports.php?action=delete&type=schedule&id=${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao excluir agendamento');

      const data = await response.json();
      if (data.success) {
        toast.success('Agendamento excluído com sucesso');
        fetchSchedules();
      }
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast.error(error.message || 'Erro ao excluir agendamento');
    }
  };

  const getRecurrenceLabel = (schedule: Schedule) => {
    switch (schedule.recurrence) {
      case 'daily':
        return `Diariamente às ${schedule.time_of_day}`;
      case 'weekly':
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return `Semanalmente ${days[schedule.day_of_week || 0]} às ${schedule.time_of_day}`;
      case 'monthly':
        return `Mensalmente dia ${schedule.day_of_month} às ${schedule.time_of_day}`;
      case 'yearly':
        return `Anualmente às ${schedule.time_of_day}`;
      default:
        return schedule.recurrence;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b dark:border-gray-700 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Calendar className="w-6 h-6 mr-3" />
              Agendamento de Relatórios
            </h2>
            <p className="text-sm mt-1 text-purple-100">
              Cliente: {clientName}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'list' && (
            <div className="space-y-4">
              {/* Botão Novo Agendamento */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Agendamentos Ativos
                </h3>
                <button
                  onClick={() => {
                    resetForm();
                    setStep('form');
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </button>
              </div>

              {/* Lista de Agendamentos */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
                </div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Nenhum agendamento configurado
                  </p>
                  <button
                    onClick={() => setStep('form')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Criar Primeiro Agendamento
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map(schedule => (
                    <div
                      key={schedule.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {schedule.schedule_name}
                            </h4>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              schedule.is_active
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              {schedule.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {schedule.report_type_name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1.5" />
                              {getRecurrenceLabel(schedule)}
                            </span>
                            {schedule.next_execution_at && (
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5" />
                                Próxima: {new Date(schedule.next_execution_at).toLocaleString('pt-BR')}
                              </span>
                            )}
                          </div>
                          {schedule.last_execution_at && (
                            <div className="mt-2 flex items-center space-x-2 text-xs">
                              {schedule.last_execution_status === 'success' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="text-gray-600 dark:text-gray-400">
                                Última execução: {new Date(schedule.last_execution_at).toLocaleString('pt-BR')}
                                {' '}({schedule.execution_count} execuções)
                              </span>
                            </div>
                          )}
                          {schedule.send_email_notification && schedule.notification_emails?.length > 0 && (
                            <div className="mt-2 flex items-center text-xs text-gray-600 dark:text-gray-400">
                              <Mail className="w-4 h-4 mr-1.5" />
                              Notificações: {schedule.notification_emails.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 pt-3 border-t dark:border-gray-700">
                        <button
                          onClick={() => handleToggleActive(schedule.id, schedule.is_active)}
                          className={`px-3 py-2 rounded-lg text-sm flex items-center transition-colors ${
                            schedule.is_active
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                          }`}
                        >
                          {schedule.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-sm flex items-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'form' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Novo Agendamento
                </h3>
                <button
                  onClick={() => setStep('list')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ← Voltar
                </button>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Agendamento
                </label>
                <input
                  type="text"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder="Ex: Relatório Semanal de Malware"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Tipo de Relatório */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Relatório
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  {reportTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recorrência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequência
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="daily">Diariamente</option>
                    <option value="weekly">Semanalmente</option>
                    <option value="monthly">Mensalmente</option>
                  </select>
                </div>

                {recurrence === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dia da Semana
                    </label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={1}>Segunda-feira</option>
                      <option value={2}>Terça-feira</option>
                      <option value={3}>Quarta-feira</option>
                      <option value={4}>Quinta-feira</option>
                      <option value={5}>Sexta-feira</option>
                      <option value={6}>Sábado</option>
                      <option value={0}>Domingo</option>
                    </select>
                  </div>
                )}

                {recurrence === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dia do Mês
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Horário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Horário de Execução
                </label>
                <input
                  type="time"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Período do Relatório */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período a Analisar
                </label>
                <select
                  value={reportingInterval}
                  onChange={(e) => setReportingInterval(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="yesterday">Ontem</option>
                  <option value="lastWeek">Última Semana</option>
                  <option value="lastMonth">Último Mês</option>
                  <option value="last2Months">Últimos 2 Meses</option>
                </select>
              </div>

              {/* Notificações */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3 mb-3">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="sendEmail" className="flex-1">
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">
                      Enviar notificações por email
                    </span>
                    <span className="block text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Receba um email quando o relatório for gerado
                    </span>
                  </label>
                </div>

                {sendEmail && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emails (separados por vírgula)
                    </label>
                    <input
                      type="text"
                      value={notificationEmails}
                      onChange={(e) => setNotificationEmails(e.target.value)}
                      placeholder="email1@exemplo.com, email2@exemplo.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Opções específicas para Malware (tipo 12) */}
              {reportType === 12 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Opções do Relatório de Malware
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="detailedExport"
                        checked={detailedExport}
                        onChange={(e) => setDetailedExport(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="detailedExport" className="text-sm text-gray-700 dark:text-gray-300">
                        Incluir detalhes completos no PDF
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Ativo */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Agendamento ativo (começar a gerar relatórios automaticamente)
                </label>
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setStep('list')}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !scheduleName}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-semibold flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Agendamento
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BitdefenderScheduleReportModal;
