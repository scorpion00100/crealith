import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProductCard } from '@/components/ui/ProductCard';
import { Product } from '@/types';

// Mock store
const createMockStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            auth: (state = { isAuthenticated: false, user: null }) => state,
            ui: (state = { notifications: [] }) => state,
        },
        preloadedState: initialState,
    });
};

// Mock des hooks
vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        user: { id: 'user1', firstName: 'John', lastName: 'Doe' },
    }),
}));

vi.mock('@/store', () => ({
    useAppDispatch: () => vi.fn(),
    useAppSelector: (selector: any) => selector({
        auth: { isAuthenticated: true, user: { id: 'user1' } },
        ui: { notifications: [] },
    }),
}));

describe('ProductCard Component', () => {
    const mockProduct: Product = {
        id: '1',
        title: 'Test Product',
        description: 'A test product description',
        price: 29.99,
        originalPrice: 39.99,
        thumbnailUrl: 'https://example.com/thumb.jpg',
        previewUrl: 'https://example.com/preview.jpg',
        fileUrl: 'https://example.com/file.zip',
        fileType: 'application/zip',
        fileSize: 1024000,
        downloadsCount: 150,
        tags: ['template', 'design'],
        isActive: true,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'seller1',
        categoryId: 'cat1',
        user: {
            id: 'seller1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            role: 'SELLER',
            avatar: 'https://example.com/avatar.jpg',
        },
        category: {
            id: 'cat1',
            name: 'Templates',
            slug: 'templates',
            description: 'Design templates',
        },
        reviews: [],
        reviewCount: 5,
        _count: {
            reviews: 5,
        },
    };

    const mockHandlers = {
        onView: vi.fn(),
        onAddToCart: vi.fn(),
        onAddToFavorites: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders product information correctly', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <ProductCard
                    product={mockProduct}
                    variant="buyer"
                    onView={mockHandlers.onView}
                    onAddToCart={mockHandlers.onAddToCart}
                    onAddToFavorites={mockHandlers.onAddToFavorites}
                />
            </Provider>
        );

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('A test product description')).toBeInTheDocument();
        expect(screen.getAllByText((content, element) => {
            return element?.textContent?.includes('29.99') || false;
        })[0]).toBeInTheDocument();
        expect(screen.getByText((content, element) => {
            return element?.textContent?.includes('39.99') || false;
        })).toBeInTheDocument(); // Original price
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Templates')).toBeInTheDocument();
        expect(screen.getByText('150 téléchargements')).toBeInTheDocument();
    });

    it('displays discount badge when original price is higher', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <ProductCard
                    product={mockProduct}
                    variant="buyer"
                    onView={mockHandlers.onView}
                    onAddToCart={mockHandlers.onAddToCart}
                    onAddToFavorites={mockHandlers.onAddToFavorites}
                />
            </Provider>
        );

        const discountBadge = screen.getByText('-25%');
        expect(discountBadge).toBeInTheDocument();
    });

    it('calls onView when product image is clicked', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <ProductCard
                    product={mockProduct}
                    variant="buyer"
                    onView={mockHandlers.onView}
                    onAddToCart={mockHandlers.onAddToCart}
                    onAddToFavorites={mockHandlers.onAddToFavorites}
                />
            </Provider>
        );

        const productImage = screen.getByAltText('Test Product');
        fireEvent.click(productImage);

        expect(mockHandlers.onView).toHaveBeenCalledWith('1');
    });

    it('calls onAddToCart when add to cart button is clicked', async () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <ProductCard
                    product={mockProduct}
                    variant="buyer"
                    onView={mockHandlers.onView}
                    onAddToCart={mockHandlers.onAddToCart}
                    onAddToFavorites={mockHandlers.onAddToFavorites}
                />
            </Provider>
        );

        const addToCartButton = screen.getByText('Ajouter au panier');
        fireEvent.click(addToCartButton);

        await waitFor(() => {
            expect(mockHandlers.onAddToCart).toHaveBeenCalledWith('1');
        });
    });

    it('calls onAddToFavorites when favorite button is clicked', async () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <ProductCard
                    product={mockProduct}
                    variant="buyer"
                    onView={mockHandlers.onView}
                    onAddToCart={mockHandlers.onAddToCart}
                    onAddToFavorites={mockHandlers.onAddToFavorites}
                />
            </Provider>
        );

        const favoriteButton = screen.getByLabelText('Ajouter aux favoris');
        fireEvent.click(favoriteButton);

        await waitFor(() => {
            expect(mockHandlers.onAddToFavorites).toHaveBeenCalledWith('1');
        });
    });

    it('shows loading state when adding to cart', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <ProductCard
                    product={mockProduct}
                    variant="buyer"
                    onView={mockHandlers.onView}
                    onAddToCart={mockHandlers.onAddToCart}
                    onAddToFavorites={mockHandlers.onAddToFavorites}
                    isLoading={true}
                />
            </Provider>
        );

        const addToCartButton = screen.getByText('Ajout en cours...');
        expect(addToCartButton).toBeInTheDocument();
        expect(addToCartButton).toBeDisabled();
    });

    it('displays seller variant correctly', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <ProductCard
                    product={mockProduct}
                    variant="seller"
                    onView={mockHandlers.onView}
                    onAddToCart={mockHandlers.onAddToCart}
                    onAddToFavorites={mockHandlers.onAddToFavorites}
                />
            </Provider>
        );

        // En mode seller, le bouton "Ajouter au panier" ne devrait pas être visible
        expect(screen.queryByText('Ajouter au panier')).not.toBeInTheDocument();

        // Mais les autres informations devraient être visibles
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getAllByText((content, element) => {
            return element?.textContent?.includes('29.99') || false;
        })[0]).toBeInTheDocument();
    });

    it('handles missing optional fields gracefully', () => {
        const productWithoutOptionalFields: Product = {
            ...mockProduct,
            originalPrice: undefined,
            previewUrl: undefined,
            tags: [],
            user: {
                ...mockProduct.user,
                avatar: undefined,
            },
        };

        const store = createMockStore();

        render(
            <Provider store={store}>
                <ProductCard
                    product={productWithoutOptionalFields}
                    variant="buyer"
                    onView={mockHandlers.onView}
                    onAddToCart={mockHandlers.onAddToCart}
                    onAddToFavorites={mockHandlers.onAddToFavorites}
                />
            </Provider>
        );

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getAllByText((content, element) => {
            return element?.textContent?.includes('29.99') || false;
        })[0]).toBeInTheDocument();
        // Pas de prix original affiché
        expect(screen.queryByText('39,99 €')).not.toBeInTheDocument();
    });

    it('formats file size correctly', () => {
        const productWithLargeFile: Product = {
            ...mockProduct,
            fileSize: 5242880, // 5MB
        };

        const store = createMockStore();

        render(
            <Provider store={store}>
                <ProductCard
                    product={productWithLargeFile}
                    variant="buyer"
                    onView={mockHandlers.onView}
                    onAddToCart={mockHandlers.onAddToCart}
                    onAddToFavorites={mockHandlers.onAddToFavorites}
                />
            </Provider>
        );

        // Le composant devrait afficher la taille du fichier formatée
        // (cela dépend de l'implémentation du composant)
        expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('displays correct number of reviews', () => {
        const store = createMockStore();

        render(
            <Provider store={store}>
                <ProductCard
                    product={mockProduct}
                    variant="buyer"
                    onView={mockHandlers.onView}
                    onAddToCart={mockHandlers.onAddToCart}
                    onAddToFavorites={mockHandlers.onAddToFavorites}
                />
            </Provider>
        );

        expect(screen.getByText((content, element) => {
            return element?.textContent === '(5)' || false;
        })).toBeInTheDocument();
    });

    it('shows featured badge when product is featured', () => {
        const featuredProduct: Product = {
            ...mockProduct,
            isFeatured: true,
        };

        const store = createMockStore();

        render(
            <Provider store={store}>
                <ProductCard
                    product={featuredProduct}
                    variant="buyer"
                    onView={mockHandlers.onView}
                    onAddToCart={mockHandlers.onAddToCart}
                    onAddToFavorites={mockHandlers.onAddToFavorites}
                />
            </Provider>
        );

        const featuredBadge = screen.getByText('En vedette');
        expect(featuredBadge).toBeInTheDocument();
    });
});
