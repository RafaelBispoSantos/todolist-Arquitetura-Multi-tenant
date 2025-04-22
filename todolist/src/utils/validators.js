// src/utils/validators.js

/**
 * Funções de validação para diferentes tipos de dados
 * Centralizadas para reutilização em todo o projeto
 */

/**
 * Valida um email
 * @param {string} email - Email para validar
 * @returns {boolean} True se válido, false caso contrário
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email);
  };
  
  /**
   * Valida uma senha
   * Deve ter pelo menos 8 caracteres, incluindo 1 número e 1 caractere especial
   * @param {string} password - Senha para validar
   * @returns {boolean} True se válido, false caso contrário
   */
  const isValidPassword = (password) => {
    if (typeof password !== 'string' || password.length < 8) {
      return false;
    }
    
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasNumber && hasSpecialChar;
  };
  
  /**
   * Valida um nome
   * @param {string} name - Nome para validar
   * @returns {boolean} True se válido, false caso contrário
   */
  const isValidName = (name) => {
    return typeof name === 'string' && name.trim().length >= 2 && name.length <= 100;
  };
  
  /**
   * Valida um subdomínio
   * @param {string} subdomain - Subdomínio para validar
   * @returns {boolean} True se válido, false caso contrário
   */
  const isValidSubdomain = (subdomain) => {
    const subdomainRegex = /^[a-z0-9-]+$/;
    return typeof subdomain === 'string' && 
           subdomain.length >= 3 && 
           subdomain.length <= 63 && 
           subdomainRegex.test(subdomain) &&
           !subdomain.startsWith('-') &&
           !subdomain.endsWith('-');
  };
  
  /**
   * Valida um nome de tenant
   * @param {string} tenantName - Nome do tenant para validar
   * @returns {boolean} True se válido, false caso contrário
   */
  const isValidTenantName = (tenantName) => {
    return typeof tenantName === 'string' && 
           tenantName.trim().length >= 2 && 
           tenantName.length <= 100;
  };
  
  /**
   * Valida um título de todo
   * @param {string} title - Título para validar
   * @returns {boolean} True se válido, false caso contrário
   */
  const isValidTitle = (title) => {
    return typeof title === 'string' && 
           title.trim().length > 0 && 
           title.length <= 255;
  };
  
  /**
   * Valida uma descrição
   * @param {string} description - Descrição para validar
   * @returns {boolean} True se válido, false caso contrário
   */
  const isValidDescription = (description) => {
    return typeof description === 'string' && description.length <= 1000;
  };
  
  /**
   * Valida uma prioridade
   * @param {string} priority - Prioridade para validar
   * @returns {boolean} True se válido, false caso contrário
   */
  const isValidPriority = (priority) => {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    return validPriorities.includes(priority);
  };
  
  /**
   * Valida um status
   * @param {string} status - Status para validar
   * @returns {boolean} True se válido, false caso contrário
   */
  const isValidStatus = (status) => {
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    return validStatuses.includes(status);
  };
  
  /**
   * Valida uma data
   * @param {string|Date} date - Data para validar
   * @returns {boolean} True se válido, false caso contrário
   */
  const isValidDate = (date) => {
    if (date instanceof Date) {
      return !isNaN(date.getTime());
    }
    
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }
    
    return false;
  };
  
  /**
   * Valida um UUID
   * @param {string} uuid - UUID para validar
   * @returns {boolean} True se válido, false caso contrário
   */
  const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex.test(uuid);
  };
  
  /**
   * Valida uma cor hexadecimal
   * @param {string} hexColor - Cor hexadecimal para validar
   * @returns {boolean} True se válido, false caso contrário
   */
  const isValidHexColor = (hexColor) => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return typeof hexColor === 'string' && hexColorRegex.test(hexColor);
  };
  
  module.exports = {
    isValidEmail,
    isValidPassword,
    isValidName,
    isValidSubdomain,
    isValidTenantName,
    isValidTitle,
    isValidDescription,
    isValidPriority,
    isValidStatus,
    isValidDate,
    isValidUUID,
    isValidHexColor,
  };