"""
Centralized logging configuration for the e-commerce backend.
Provides structured logging for all application components.
"""
import os
from pathlib import Path

# Base directory for logs
BASE_DIR = Path(__file__).resolve().parent.parent
LOGS_DIR = BASE_DIR / 'logs'

# Ensure logs directory exists
LOGS_DIR.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} [{name}] {module}.{funcName}:{lineno} - {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} - {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file_general': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'ecommerce.log',
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'file_errors': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'errors.log',
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'file_payments': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'payments.log',
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 10,  # Keep more payment logs
            'formatter': 'verbose',
        },
        'file_orders': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'orders.log',
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'file_security': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'security.log',
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file_general'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['file_errors', 'console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['file_security', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'payments': {
            'handlers': ['file_payments', 'console'],
            'level': os.environ.get('LOG_LEVEL_PAYMENTS', 'DEBUG'),
            'propagate': False,
        },
        'orders': {
            'handlers': ['file_orders', 'console'],
            'level': os.environ.get('LOG_LEVEL_ORDERS', 'INFO'),
            'propagate': False,
        },
        'shop': {
            'handlers': ['file_general', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'users': {
            'handlers': ['file_general', 'file_security', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console', 'file_general'],
        'level': 'INFO',
    },
}
