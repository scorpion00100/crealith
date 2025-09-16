import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchOrders } from '@/store/slices/orderSlice';
import { Link, useNavigate } from 'react-router-dom';

export const OrdersPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { orders, isLoading, error } = useAppSelector(s => s.orders);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return orders.slice(start, start + pageSize);
    }, [orders, page]);

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Mes commandes</h1>
                    <Link to="/catalog" className="text-primary-400 hover:text-primary-300">Continuer mes achats</Link>
                </div>

                {isLoading && <div>Chargement…</div>}
                {error && <div className="text-red-400">{error}</div>}

                {!isLoading && orders.length === 0 && (
                    <div className="p-6 bg-background-800 border border-background-700 rounded-xl">
                        <p>Vous n'avez pas encore de commandes.</p>
                        <button onClick={() => navigate('/catalog')} className="mt-3 btn btn-primary">Parcourir le catalogue</button>
                    </div>
                )}

                {!isLoading && orders.length > 0 && (
                    <div className="space-y-4">
                        {paged.map(o => (
                            <div key={o.id} className="p-4 bg-background-800 border border-background-700 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{o.orderNumber}</div>
                                        <div className="text-sm text-text-400">{new Date(o.createdAt as any).toLocaleString('fr-FR')} • {o.status}</div>
                                    </div>
                                    <div className="font-bold">{Number(o.totalAmount).toFixed(2)} €</div>
                                </div>
                                {Array.isArray((o as any).items) && (o as any).items.length > 0 && (
                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {(o as any).items.slice(0, 4).map((it: any) => (
                                            <div key={it.id} className="text-sm text-text-300 truncate">
                                                {it.quantity} × {it.product?.title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {Math.ceil(orders.length / pageSize) > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <button className="px-3 py-1 bg-background-800 border border-background-700 rounded-lg text-text-100 disabled:opacity-50" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Précédent</button>
                                <span className="text-text-400 text-sm">Page {page} / {Math.ceil(orders.length / pageSize)}</span>
                                <button className="px-3 py-1 bg-background-800 border border-background-700 rounded-lg text-text-100 disabled:opacity-50" disabled={page >= Math.ceil(orders.length / pageSize)} onClick={() => setPage(p => p + 1)}>Suivant</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrdersPage;
