"""
Custom exception handling for the e-commerce API.
Provides consistent error responses with clear messages.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404

logger = logging.getLogger('django.request')


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses.
    
    Returns error responses in the format:
    {
        "error": true,
        "message": "User-friendly error message",
        "details": {...},  // Optional detailed error info
        "error_code": "SPECIFIC_ERROR_CODE"  // Optional error code
    }
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Log the exception
    view = context.get('view', None)
    request = context.get('request', None)
    
    if view and request:
        logger.error(
            f"Exception in {view.__class__.__name__}: {str(exc)}",
            extra={
                'path': request.path,
                'method': request.method,
                'user': getattr(request.user, 'id', 'anonymous'),
            },
            exc_info=True
        )
    
    # Handle exceptions not caught by DRF
    if response is None:
        # Handle Django's Http404
        if isinstance(exc, Http404):
            return Response(
                {
                    'error': True,
                    'message': 'The requested resource was not found.',
                    'error_code': 'NOT_FOUND',
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Handle Django's ValidationError
        if isinstance(exc, DjangoValidationError):
            return Response(
                {
                    'error': True,
                    'message': 'Validation error occurred.',
                    'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc),
                    'error_code': 'VALIDATION_ERROR',
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Handle unexpected exceptions
        logger.error(
            f"Unhandled exception: {str(exc)}",
            exc_info=True
        )
        
        return Response(
            {
                'error': True,
                'message': 'An unexpected error occurred. Please try again later.',
                'error_code': 'INTERNAL_ERROR',
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Customize the response format for DRF exceptions
    if response is not None:
        error_data = {
            'error': True,
            'message': get_error_message(exc, response.data),
            'details': response.data if isinstance(response.data, dict) else {'detail': response.data},
        }
        
        # Add error code if available
        if hasattr(exc, 'default_code'):
            error_data['error_code'] = exc.default_code.upper()
        
        response.data = error_data
    
    return response


def get_error_message(exc, data):
    """
    Extract a user-friendly error message from the exception or response data.
    """
    # Try to get a message from the exception
    if hasattr(exc, 'detail'):
        if isinstance(exc.detail, str):
            return exc.detail
        elif isinstance(exc.detail, dict) and 'detail' in exc.detail:
            return exc.detail['detail']
    
    # Try to extract from response data
    if isinstance(data, dict):
        if 'detail' in data:
            return data['detail']
        elif 'message' in data:
            return data['message']
        # If it's a field error, create a summary message
        elif any(key not in ['error', 'error_code'] for key in data.keys()):
            return 'Validation error. Please check the provided data.'
    
    # Default message
    return str(exc) if str(exc) else 'An error occurred while processing your request.'


class APIException(Exception):
    """
    Base exception class for custom API exceptions.
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = 'An error occurred'
    error_code = 'API_ERROR'
    
    def __init__(self, message=None, status_code=None, error_code=None):
        self.message = message or self.default_message
        if status_code:
            self.status_code = status_code
        if error_code:
            self.error_code = error_code
        super().__init__(self.message)


class OrderError(APIException):
    """Exception raised for order-related errors."""
    default_message = 'Order operation failed'
    error_code = 'ORDER_ERROR'


class PaymentError(APIException):
    """Exception raised for payment-related errors."""
    default_message = 'Payment operation failed'
    error_code = 'PAYMENT_ERROR'


class ProductNotFoundError(APIException):
    """Exception raised when a product is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    default_message = 'Product not found'
    error_code = 'PRODUCT_NOT_FOUND'


class InsufficientStockError(APIException):
    """Exception raised when there's insufficient stock."""
    default_message = 'Insufficient stock for the requested quantity'
    error_code = 'INSUFFICIENT_STOCK'
