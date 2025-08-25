export const handleApiError = (error: any): string => {
  if (error.response) {
    // Erreur de réponse du serveur
    return error.response.data?.message || `Erreur ${error.response.status}`;
  } else if (error.request) {
    // Erreur de réseau
    return 'Erreur de connexion au serveur';
  } else {
    // Autre erreur
    return error.message || 'Une erreur inattendue est survenue';
  }
};

export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  return formData;
};