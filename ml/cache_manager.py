import hashlib
import json
import pickle
import logging
from typing import Any, Optional, Dict, List
from datetime import datetime, timedelta
import redis
from fastapi import HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self, redis_url: str = None):
        import os
        if redis_url is None:
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        try:
            self.redis_client = redis.Redis.from_url(redis_url, decode_responses=False, socket_connect_timeout=5)
            # Проверяем подключение
            self.redis_client.ping()
            logger.info(f"Successfully connected to Redis at {redis_url}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            self.redis_client = None
        self.async_redis = None
        self.cache_prefix = "ml_forecast:"
        self.default_ttl = 3600  # 1 час
        
    async def get_async_redis(self):
        # Для простоты используем синхронный Redis клиент
        return self.redis_client
    
    def generate_cache_key(self, payload: List[Dict], horizon: int) -> str:
        """Генерирует ключ кеша на основе хеша данных и горизонта прогноза"""
        # Создаем хеш из payload и horizon
        data_str = json.dumps(payload, sort_keys=True, default=str)
        hash_obj = hashlib.sha256(f"{data_str}:{horizon}".encode())
        return f"{self.cache_prefix}{hash_obj.hexdigest()}"
    
    def get_cached_forecast(self, cache_key: str) -> Optional[Dict]:
        """Получает прогноз из кеша"""
        if not self.redis_client:
            return None
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                result = pickle.loads(cached_data)
                logger.info(f"Cache hit for key: {cache_key}")
                return result
            logger.info(f"Cache miss for key: {cache_key}")
            return None
        except Exception as e:
            logger.error(f"Error getting cached forecast: {str(e)}")
            return None
    
    def set_cached_forecast(self, cache_key: str, forecast: Dict, ttl: int = None) -> bool:
        """Сохраняет прогноз в кеш"""
        if not self.redis_client:
            return False
        try:
            ttl = ttl or self.default_ttl
            cached_data = pickle.dumps(forecast)
            self.redis_client.setex(cache_key, ttl, cached_data)
            logger.info(f"Cache set for key: {cache_key}, TTL: {ttl}")
            return True
        except Exception as e:
            logger.error(f"Error setting cached forecast: {str(e)}")
            return False
    
    def invalidate_cache_by_pattern(self, pattern: str = None):
        """Инвалидирует кеш по паттерну"""
        try:
            pattern = pattern or f"{self.cache_prefix}*"
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"Invalidated {len(keys)} cache entries with pattern: {pattern}")
                return len(keys)
            return 0
        except Exception as e:
            logger.error(f"Error invalidating cache: {str(e)}")
            return 0
    
    def invalidate_cache_for_items(self, item_names: List[str]):
        """Инвалидирует кеш для конкретных товаров"""
        try:
            all_keys = self.redis_client.keys(f"{self.cache_prefix}*")
            invalidated = 0
            
            for key in all_keys:
                try:
                    cached_data = self.redis_client.get(key)
                    if cached_data:
                        forecast = pickle.loads(cached_data)
                        # Проверяем, содержит ли прогноз данные о товарах
                        if self._forecast_contains_items(forecast, item_names):
                            self.redis_client.delete(key)
                            invalidated += 1
                except Exception as e:
                    logger.error(f"Error checking cache key {key}: {str(e)}")
                    continue
            
            logger.info(f"Invalidated {invalidated} cache entries for items: {item_names}")
            return invalidated
        except Exception as e:
            logger.error(f"Error invalidating cache for items: {str(e)}")
            return 0
    
    def _forecast_contains_items(self, forecast: Dict, item_names: List[str]) -> bool:
        """Проверяет, содержит ли прогноз указанные товары"""
        if not isinstance(forecast, list):
            return False
        
        for item in forecast:
            if isinstance(item, dict) and "Номенклатура" in item:
                if item["Номенклатура"] in item_names:
                    return True
        return False
    
    def get_cache_stats(self) -> Dict:
        """Получает статистику кеша"""
        try:
            info = self.redis_client.info()
            keys_count = len(self.redis_client.keys(f"{self.cache_prefix}*"))
            
            return {
                "redis_version": info.get("redis_version", "unknown"),
                "used_memory": info.get("used_memory_human", "unknown"),
                "connected_clients": info.get("connected_clients", 0),
                "cache_keys_count": keys_count,
                "uptime_in_seconds": info.get("uptime_in_seconds", 0)
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return {"error": str(e)}
    
    def health_check(self) -> bool:
        """Проверяет доступность Redis"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except Exception as e:
            logger.error(f"Redis health check failed: {str(e)}")
            return False

# Глобальный экземпляр менеджера кеша
cache_manager = CacheManager()
