import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, extractApiError } from '../utils/api.js';
import { toast } from 'react-toastify';

export const useCrud = (endpoint, { onListMapped } = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/${endpoint}`);
      setItems(onListMapped ? onListMapped(data) : data);
    } catch (err) {
      console.error(err);
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [endpoint, onListMapped]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = useCallback(async (payload) => {
    try {
      const { data } = await api.post(`/${endpoint}`, payload);
      toast.success('Registro creado correctamente');
      setItems((prev) => [...prev, data]);
      return data;
    } catch (error) {
      const message = extractApiError(error);
      toast.error(message);
      throw error;
    }
  }, [endpoint]);

  const updateItem = useCallback(async (id, payload) => {
    try {
      const { data } = await api.put(`/${endpoint}/${id}`, payload);
      toast.success('Registro actualizado');
      setItems((prev) => prev.map((item) => (item.id === id ? data : item)));
      return data;
    } catch (error) {
      const message = extractApiError(error);
      toast.error(message);
      throw error;
    }
  }, [endpoint]);

  const deleteItem = useCallback(async (id) => {
    try {
      await api.delete(`/${endpoint}/${id}`);
      toast.success('Registro eliminado');
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      const message = extractApiError(error);
      toast.error(message);
      throw error;
    }
  }, [endpoint]);

  return useMemo(() => ({
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  }), [createItem, deleteItem, error, fetchItems, items, loading, updateItem]);
};
