import React, { useEffect, useState, useRef } from 'react';
import { useDataProvider } from 'react-admin';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

const Dashboard = () => {
    const dataProvider = useDataProvider();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    const intervalIdRef = useRef();

    const fetchMetrics = async () => {
        try {
            const response = await dataProvider.getList('metrics', {
                pagination: { page: 1, perPage: 10 },
                sort: { field: 'date', order: 'ASC' },
                filter: {},
            });
            setMetrics(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching metrics:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        intervalIdRef.current = setInterval(fetchMetrics, 10000);

        return () => clearInterval(intervalIdRef.current);
    }, []);

    if (loading || !metrics) return <div>Loading...</div>;

    return (
        <div className="grid grid-cols-2 gap-4">
            <Card>
                <CardContent>
                    <h2 className="text-xl font-bold mb-2">Utilisateurs</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={metrics.users}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="active" fill="#8884d8" />
                            <Bar dataKey="inactive" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <h2 className="text-xl font-bold mb-2">Salons</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={metrics.rooms}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="active" fill="#8884d8" />
                            <Bar dataKey="inactive" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <h2 className="text-xl font-bold mb-2">Serveur</h2>
                    <div>Uptime: {metrics.server.uptime}</div>
                    <div>Load: {metrics.server.load}</div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
