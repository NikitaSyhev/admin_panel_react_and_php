
import React from 'react';
import { createRoot } from 'react-dom/client'; // Импортируем createRoot
import Editor from './components/editor';

const root = createRoot(document.getElementById('root')); // Создаем root
root.render(<Editor />); // Рендерим компонент




