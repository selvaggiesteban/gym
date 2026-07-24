import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Dumbbell, Filter } from 'lucide-react';

const EXERCISES_JSON_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';
const CACHE_KEY = 'gym_exercises_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
    return data;
  } catch { return null; }
}

function saveToCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

export default function ExerciseLibrary({ onSelect, selectedIds = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [bodyPart, setBodyPart] = useState('all');
  const [equipment, setEquipment] = useState('all');
  const listRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(30);

  const { data: cachedExercises } = useQuery({
    queryKey: ['exercises-cache'],
    queryFn: () => loadFromCache(),
    staleTime: Infinity,
  });

  const { data: fetchedExercises, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const cached = loadFromCache();
      if (cached) return cached;
      const res = await fetch(EXERCISES_JSON_URL);
      if (!res.ok) throw new Error('Failed to fetch exercises');
      const data = await res.json();
      saveToCache(data);
      return data;
    },
    staleTime: CACHE_TTL,
  });

  const exercises = fetchedExercises || cachedExercises || [];

  const bodyParts = useMemo(() => {
    const set = new Set();
    exercises.forEach(e => { if (e.bodyPart) set.add(e.bodyPart); });
    return [...set].sort();
  }, [exercises]);

  const equipmentTypes = useMemo(() => {
    const set = new Set();
    exercises.forEach(e => { if (e.equipment) set.add(e.equipment); });
    return [...set].sort();
  }, [exercises]);

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      const matchSearch = !searchTerm || (e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (e.secondaryMuscles || []).some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchBodyPart = bodyPart === 'all' || e.bodyPart === bodyPart;
      const matchEquipment = equipment === 'all' || e.equipment === equipment;
      return matchSearch && matchBodyPart && matchEquipment;
    });
  }, [exercises, searchTerm, bodyPart, equipment]);

  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(30);
  }, [searchTerm, bodyPart, equipment]);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 200 && visibleCount < filtered.length) {
      setVisibleCount(prev => Math.min(prev + 30, filtered.length));
    }
  };

  if (isLoading) {
    return (
      <Card className="neu-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando biblioteca de ejercicios...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neu-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Dumbbell className="w-5 h-5" />Biblioteca de Ejercicios ({filtered.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input placeholder="Buscar ejercicio..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={bodyPart} onValueChange={setBodyPart}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Parte del cuerpo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {bodyParts.map(bp => <SelectItem key={bp} value={bp}>{bp}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={equipment} onValueChange={setEquipment}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Equipamiento" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {equipmentTypes.map(eq => <SelectItem key={eq} value={eq}>{eq}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div ref={listRef} onScroll={handleScroll} className="space-y-2 max-h-[50vh] overflow-y-auto">
          {visible.map(exercise => {
            const isSelected = selectedIds.includes(exercise.id);
            return (
              <div
                key={exercise.id}
                className={`border-2 p-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}
                onClick={() => onSelect?.(exercise)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">{exercise.name}</h4>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {exercise.bodyPart && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{exercise.bodyPart}</span>}
                      {exercise.target && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{exercise.target}</span>}
                      {exercise.equipment && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{exercise.equipment}</span>}
                    </div>
                  </div>
                  {isSelected && <span className="text-blue-500 font-bold text-xs">SELECCIONADO</span>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-gray-500 text-center py-8">No se encontraron ejercicios</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
