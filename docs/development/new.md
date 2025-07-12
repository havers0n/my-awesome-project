gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="bg-blue-100 rounded-full p-2">
                     <Eye className="w-5 h-5 text-blue-600" />
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-gray-800">Справочная информация</h3>
                     <p className="text-sm text-gray-600">Статусы и возможности системы</p>
                   </div>
                 </div>
                 <button
                   onClick={() => setShowHelpPanel(false)}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   <XCircle className="w-6 h-6" />
                 </button>
               </div>

               {/* Содержимое панели */}
               <div className="flex-1 overflow-y-auto p-6">
                 <div className="space-y-8">
                   {/* Статусы товаров */}
                   <div>
                     <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                       <Eye className="w-5 h-5 text-purple-500" />
                       Статусы товаров
                     </h4>
                     <div className="space-y-3">
                       {[
                         { status: 'available', desc: 'В наличии', fullDesc: 'Товар есть в достаточном количестве' },
                         { status: 'low_stock', desc: 'Заканчивается', fullDesc: 'Остаток менее 30% от общего объема' },
                         { status: 'critical', desc: 'Критично', fullDesc: 'Остаток менее 10% от общего объема' },
                         { status: 'out_of_stock', desc: 'Отсутствует', fullDesc: 'Товара нет в наличии' }
                       ].map((item, index) => {
                         const config = getStatusConfig(item.status);
                         return (
                           <div 
                             key={index}
                             className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4`}
                           >
                             <div className="flex items-center gap-3 mb-2">
                               <div className={`${config.iconColor}`}>
                                 {config.icon}
                               </div>
                               <div className={`font-semibold ${config.textColor}`}>
                                 {item.desc}
                               </div>
                             </div>
                             <p className="text-sm text-gray-600 ml-7">{item.fullDesc}</p>
                           </div>
                         );
                       })}
                     </div>
                   </div>

                   {/* Возможности системы */}
                   <div>
                     <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                       <TrendingUp className="w-5 h-5 text-green-500" />
                       Возможности системы
                     </h4>
                     <div className="space-y-4">
                       <div className="bg-blue-50 rounded-xl p-4">
                         <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                           <Search className="w-4 h-4" />
                           Поиск и фильтрация
                         </h5>
                         <ul className="text-sm text-blue-700 space-y-1">
                           <li>• Поиск по названию товара</li>
                           <li>• Поиск по номеру полки (например, A1-01)</li>
                           <li>• Фильтрация по статусу доступности</li>
                           <li>• Быстрые фильтры по критичности</li>
                         </ul>
                       </div>

                       <div className="bg-green-50 rounded-xl p-4">
                         <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                           <BarChart3 className="w-4 h-4" />
                           Аналитика и отчеты
                         </h5>
                         <ul className="text-sm text-green-700 space-y-1">
                           <li>• Местоположение на полке</li>
                           <li>• Доступное/общее количество</li>
                           <li>• Время отсутствия товара</li>
                           <li>• Статистика по категориям</li>
                         </ul>
                       </div>

                       <div className="bg-purple-50 rounded-xl p-4">
                         <h5 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                           <Zap className="w-4 h-4" />
                           Быстрые действия
                         </h5>
                         <ul className="text-sm text-purple-700 space-y-1">
                           <li>• Обновление данных в реальном времени</li>
                           <li>• Экспорт отчетов</li>
                           <li>• Сканирование QR-кодов</li>
                           <li>• Интеграция с внешними системами</li>
                         </ul>
                       </div>

                       <div className="bg-orange-50 rounded-xl p-4">
                         <h5 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                           <Clock className="w-4 h-4" />
                           Трекинг отсутствия
                         </h5>
                         <ul className="text-sm text-orange-700 space-y-1">
                           <li>• Учет времени отсутствия товаров</li>
                           <li>• Автоматические уведомления</li>
                           <li>• История изменений статуса</li>
                           <li>• Планирование пополнений</li>
                         </ul>
                       </div>
                     </div>
                   </div>

                   {/* Горячие клавиши */}
                   <div>
                     <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                       <Target className="w-5 h-5 text-red-500" />
                       Горячие клавиши
                     </h4>
                     <div className="bg-gray-50 rounded-xl p-4">
                       <div className="space-y-2 text-sm">
                         <div className="flex items-center justify-between">
                           <span className="text-gray-700">Поиск</span>
                           <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + F</kbd>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-gray-700">Обновить</span>
                           <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">F5</kbd>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-gray-700">Справка</span>
                           <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">F1</kbd>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-gray-700">Экспорт</span>
                           <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + E</kbd>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Нижняя часть с кнопками */}
               <div className="border-t border-gray-200 p-4 bg-gray-50">
                 <div className="flex gap-3">
                   <button
                     onClick={() => alert('Техническая поддержка')}
                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                   >
                     <MessageSquare className="w-4 h-4" />
                     <span className="text-sm">Поддержка</span>
                   </button>
                   <button
                     onClick={() => setShowHelpPanel(false)}
                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                   >
                     <XCircle className="w-4 h-4" />
                     <span className="text-sm">Закрыть</span>
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
};

export default ShelfAvailabilityPage;