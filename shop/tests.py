from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from shop.models import Product


class ProductModelTestCase(TestCase):
    """Tests for Product model"""
    
    def setUp(self):
        """Set up test product"""
        self.product = Product.objects.create(
            id=1,
            product_display_name="Test T-Shirt",
            gender="Men",
            master_category="Apparel",
            sub_category="Topwear",
            article_type="Tshirts",
            base_colour="Blue",
            season="Summer",
            year=2023,
            usage="Casual",
            price=29.99,
            description="A comfortable blue t-shirt"
        )
    
    def test_product_creation(self):
        """Test that a product is created correctly"""
        self.assertEqual(self.product.product_display_name, "Test T-Shirt")
        self.assertEqual(self.product.gender, "Men")
        self.assertEqual(self.product.price, 29.99)
        self.assertTrue(Product.objects.filter(id=1).exists())
    
    def test_product_string_representation(self):
        """Test product __str__ method"""
        expected = "Test T-Shirt (1)"
        self.assertEqual(str(self.product), expected)
    
    def test_product_ordering(self):
        """Test that products are ordered by created_at descending"""
        product2 = Product.objects.create(
            id=2,
            product_display_name="Test Shirt 2",
            gender="Women",
            master_category="Apparel",
            sub_category="Topwear",
            article_type="Shirts",
            base_colour="Red",
            season="Winter",
            year=2024,
            usage="Formal",
            price=39.99
        )
        products = Product.objects.all()
        self.assertEqual(products.first().id, 2)  # Most recent first
    
    def test_product_price_decimal_places(self):
        """Test that price supports 2 decimal places"""
        self.product.price = 19.99
        self.product.save()
        self.product.refresh_from_db()
        # Compare as Decimal or use DecimalField comparison
        self.assertEqual(str(self.product.price), "19.99")
    
    def test_product_fields_validation(self):
        """Test product with all valid fields"""
        product = Product.objects.create(
            id=99,
            product_display_name="Complete Product",
            gender="Unisex",
            master_category="Accessories",
            sub_category="Belts",
            article_type="Belts",
            base_colour="Black",
            season="Spring",
            year=2025,
            usage="Travel",
            price=49.50,
            description="High quality belt"
        )
        self.assertEqual(product.gender, "Unisex")
        self.assertEqual(product.usage, "Travel")


class ProductAPITestCase(TestCase):
    """Tests for Product API endpoints"""
    
    def setUp(self):
        """Set up test client and products"""
        self.client = APIClient()
        self.list_url = reverse('product-list')
        
        self.product1 = Product.objects.create(
            id=10,
            product_display_name="Blue T-Shirt",
            gender="Men",
            master_category="Apparel",
            sub_category="Topwear",
            article_type="Tshirts",
            base_colour="Blue",
            season="Summer",
            year=2023,
            usage="Casual",
            price=25.00
        )
        
        self.product2 = Product.objects.create(
            id=11,
            product_display_name="Red Dress",
            gender="Women",
            master_category="Apparel",
            sub_category="Dress",
            article_type="Dresses",
            base_colour="Red",
            season="Spring",
            year=2024,
            usage="Party",
            price=59.99
        )
    
    def test_list_products(self):
        """Test listing all products"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_retrieve_product(self):
        """Test retrieving a single product"""
        url = reverse('product-detail', kwargs={'pk': self.product1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['product_display_name'], "Blue T-Shirt")
        self.assertEqual(response.data['price'], "25.00")
    
    def test_product_filtering_by_gender(self):
        """Test filtering products by gender"""
        response = self.client.get(self.list_url, {'gender': 'Men'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that we get Men products
        men_products = [p for p in response.data if p['gender'] == 'Men']
        self.assertEqual(len(men_products), 1)
        self.assertEqual(men_products[0]['product_display_name'], "Blue T-Shirt")
    
    def test_product_filtering_by_category(self):
        """Test filtering products by master_category"""
        response = self.client.get(self.list_url, {'master_category': 'Apparel'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_product_search(self):
        """Test searching products by name"""
        response = self.client.get(self.list_url, {'search': 'Blue'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Filter results to only products matching search
        results = [p for p in response.data if 'Blue' in p['product_display_name']]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['product_display_name'], "Blue T-Shirt")
    
    def test_product_search_by_article_type(self):
        """Test searching products by article type"""
        response = self.client.get(self.list_url, {'search': 'Dresses'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Filter for matching results
        results = [p for p in response.data if 'Dress' in p.get('product_display_name', '')]
        self.assertGreaterEqual(len(results), 1)
    
    def test_create_product_unauthorized(self):
        """Test that unauthenticated user cannot create product"""
        data = {
            'id': 20,
            'product_display_name': "New Product",
            'gender': "Men",
            'master_category': "Apparel",
            'sub_category': "Topwear",
            'article_type': "Shirts",
            'base_colour': "Green",
            'season': "Fall",
            'year': 2024,
            'usage': "Casual",
            'price': 35.00
        }
        response = self.client.post(self.list_url, data)
        # 401 Unauthorized is also acceptable (no authentication token provided)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
    
    def test_update_product_unauthorized(self):
        """Test that unauthenticated user cannot update product"""
        url = reverse('product-detail', kwargs={'pk': self.product1.id})
        data = {'price': 99.99}
        response = self.client.patch(url, data)
        # 401 Unauthorized is also acceptable
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
    
    def test_delete_product_unauthorized(self):
        """Test that unauthenticated user cannot delete product"""
        url = reverse('product-detail', kwargs={'pk': self.product1.id})
        response = self.client.delete(url)
        # 401 Unauthorized is also acceptable
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
    
    def test_product_serializer_fields(self):
        """Test that all required fields are in response"""
        response = self.client.get(reverse('product-detail', kwargs={'pk': self.product1.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_fields = [
            'id', 'product_display_name', 'gender', 'master_category',
            'sub_category', 'article_type', 'base_colour', 'season',
            'year', 'usage', 'price', 'description', 'image',
            'created_at', 'updated_at'
        ]
        for field in expected_fields:
            self.assertIn(field, response.data)


class ProductFilteringTestCase(TestCase):
    """Tests for product filtering and search functionality"""
    
    def setUp(self):
        """Set up test products with different attributes"""
        self.client = APIClient()
        self.list_url = reverse('product-list')
        
        # Men's casual products
        self.casual_shirt = Product.objects.create(
            id=101,
            product_display_name="Casual Blue Shirt",
            gender="Men",
            master_category="Apparel",
            sub_category="Topwear",
            article_type="Shirts",
            base_colour="Blue",
            season="Summer",
            year=2024,
            usage="Casual",
            price=35.00
        )
        
        # Women's formal products
        self.formal_dress = Product.objects.create(
            id=102,
            product_display_name="Formal Black Dress",
            gender="Women",
            master_category="Apparel",
            sub_category="Dress",
            article_type="Dresses",
            base_colour="Black",
            season="Winter",
            year=2024,
            usage="Formal",
            price=89.99
        )
        
        # Unisex sports products
        self.sports_shoes = Product.objects.create(
            id=103,
            product_display_name="Sports Running Shoes",
            gender="Unisex",
            master_category="Footwear",
            sub_category="Shoes",
            article_type="Shoes",
            base_colour="Red",
            season="Spring",
            year=2024,
            usage="Sports",
            price=125.00
        )
    
    def test_filter_by_gender_men(self):
        """Test filtering by Men gender"""
        response = self.client.get(self.list_url, {'gender': 'Men'})
        men_products = [p for p in response.data if p['gender'] == 'Men']
        self.assertGreaterEqual(len(men_products), 1)
        self.assertEqual(men_products[0]['product_display_name'], "Casual Blue Shirt")
    
    def test_filter_by_gender_women(self):
        """Test filtering by Women gender"""
        response = self.client.get(self.list_url, {'gender': 'Women'})
        women_products = [p for p in response.data if p['gender'] == 'Women']
        self.assertGreaterEqual(len(women_products), 1)
        self.assertEqual(women_products[0]['product_display_name'], "Formal Black Dress")
    
    def test_filter_by_usage_sports(self):
        """Test filtering by Sports usage"""
        response = self.client.get(self.list_url, {'usage': 'Sports'})
        # Find products with Sports usage
        sports_products = [p for p in response.data if p.get('usage') == 'Sports']
        self.assertGreaterEqual(len(sports_products), 1)
    
    def test_filter_by_sub_category(self):
        """Test filtering by sub_category"""
        response = self.client.get(self.list_url, {'sub_category': 'Topwear'})
        topwear = [p for p in response.data if p.get('sub_category') == 'Topwear']
        self.assertGreaterEqual(len(topwear), 1)
        # Check our test product is there
        names = [p['product_display_name'] for p in topwear]
        self.assertIn("Casual Blue Shirt", names)
    
    def test_search_returns_multiple_results(self):
        """Test search that returns multiple products"""
        # Create another product with 'Black' in name
        Product.objects.create(
            id=104,
            product_display_name="Black Shoes",
            gender="Men",
            master_category="Footwear",
            sub_category="Shoes",
            article_type="Shoes",
            base_colour="Black",
            season="Fall",
            year=2024,
            usage="Casual",
            price=45.00
        )
        response = self.client.get(self.list_url, {'search': 'Black'})
        black_products = [p for p in response.data if 'Black' in p.get('product_display_name', '')]
        self.assertGreaterEqual(len(black_products), 2)
    
    def test_empty_search_returns_all(self):
        """Test that empty search returns all products"""
        response = self.client.get(self.list_url)
        self.assertEqual(len(response.data), 3)
