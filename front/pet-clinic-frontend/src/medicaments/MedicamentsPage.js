import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './MedicamentsPage.css'

const MedicamentsPage = () => {
    const navigate = useNavigate();
    
    const [topItemsData, setTopItemsData] = useState([]);
    const [loadingOrdered, setLoadingOrdered] = useState(true);
    const [errorOrdered, setErrorOrdered] = useState(null);

    const [topExpiredData, setTopExpiredData] = useState([]);
    const [loadingExpired, setLoadingExpired] = useState(true);
    const [errorExpired, setErrorExpired] = useState(null);


    const [riskItemsData, setRiskItemsData] = useState([]);
    const [loadingRisk, setLoadingRisk] = useState(true);
    const [errorRisk, setErrorRisk] = useState(null);

    const [stockData, setStockData] = useState([]); 
    const [loadingStock, setLoadingStock] = useState(true); 

    const [summaryStockData, setSummaryStockData] = useState([]); 
    const [loadingSummaryStock, setLoadingSummaryStock] = useState(true); 
    const [errorSummaryStock, setErrorSummaryStock] = useState(null);


    const fetchTopOrderedItems = async () => {
        setLoadingOrdered(true);
        setErrorOrdered(null);
        try {
            const token = localStorage.getItem('token'); 
            const response = await fetch('/api/topordered', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Neuspešno dohvaćanje podataka o najčešće poručivanim stavkama.');
            }

            const data = await response.json();

            const formattedData = data.map(dto => ({
                name: dto.item.name, 
                orders: dto.orderCount, 
            }));

            setTopItemsData(formattedData);
        } catch (err) {
            console.error("Fetch error - Top Ordered:", err);
            setErrorOrdered('Greška pri učitavanju top poručenih stavki.');
        } finally {
            setLoadingOrdered(false);
        }
    };
    
    const fetchTopExpiredWriteOffs = async () => {
        setLoadingExpired(true);
        setErrorExpired(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/topexpired', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Neuspešno dohvaćanje podataka o otpisanim stavkama.');
            }

            const data = await response.json();

            const formattedData = data.map(dto => ({
                name: dto.itemName,
                count: dto.writeOffCount,
            }));

            setTopExpiredData(formattedData);
        } catch (err) {
            console.error("Fetch error - Top Expired:", err);
            setErrorExpired('Greška pri učitavanju top otpisanih stavki.');
        } finally {
            setLoadingExpired(false);
        }
    };

    const fetchExpirationRiskItems = async () => {
        setLoadingRisk(true);
        setLoadingStock(true); 
        setErrorRisk(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/expirationrisk', { 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Neuspešno dohvaćanje zaliha pod rizikom.');
            }

            const data = await response.json();
            
            setRiskItemsData(data);

            const summaryMap = data.reduce((acc, item) => {
                const currentQuantity = acc.get(item.itemName) || 0;

                const quantity = item.quantity ? parseInt(item.quantity) : 0; 

                acc.set(item.itemName, currentQuantity + quantity);
                return acc;
            }, new Map());

            const summaryData = Array.from(summaryMap, ([itemName, totalQuantity]) => ({ 
                itemName, 
                totalQuantity 
            }));
            
            setStockData(summaryData); 
        } catch (err) {
            console.error("Fetch error - Expiration Risk/Stock:", err);
            setErrorRisk('Greška pri učitavanju zaliha pod rizikom.');
        } finally {
            setLoadingRisk(false);
            setLoadingStock(false);
        }
    };

    const fetchSummaryAvailableStock = async () => {
        setLoadingSummaryStock(true);
        setErrorSummaryStock(null);
        try {
            const token = localStorage.getItem('token');
            // KORISTIMO ZAHTEVANI ENDPOINT
            const response = await fetch('/api/summary-available', { 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Neuspešno dohvaćanje sumarnog stanja zaliha.');
            }

            const data = await response.json();
            // Pretpostavljeni DTO format: [{ itemName: '...', totalQuantity: N }, ...]
            
            setSummaryStockData(data); 
        } catch (err) {
            console.error("Fetch error - Summary Stock:", err);
            setErrorSummaryStock('Greška pri učitavanju sumarnog stanja zaliha.');
        } finally {
            setLoadingSummaryStock(false);
        }
    };

    useEffect(() => {
        fetchTopOrderedItems();
        fetchTopExpiredWriteOffs(); 
        fetchExpirationRiskItems(); 
        fetchSummaryAvailableStock();
    }, []);

    const handleLogout = () => {
        if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
             localStorage.removeItem('user');
             localStorage.removeItem('token');
             navigate('/');
        }
    };

    const handleBackToDashboard = () => {
        navigate('/manager-dashboard');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };


    const ExpirationRiskTable = () => {
        if (loadingRisk) return <p className="loading-text">Učitavanje zaliha pod rizikom...</p>;
        if (errorRisk) return <p className="error-text">❌ {errorRisk}</p>;
        if (riskItemsData.length === 0) return <p className="no-data-text">Nema zaliha koje ističu u narednih 30 dana.</p>;

        return (
            <div className="risk-table-container">
                <table className="risk-table">
                    <thead>
                        <tr>
                            <th>Naziv Stavke</th>
                            <th>Datum Isteka</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riskItemsData.map((item, index) => (
                            <tr key={index} className={new Date(item.expirationDate) < new Date() ? 'expired-row' : ''}>
                                <td className="font-semibold">{item.itemName}</td>
                                <td>
                                    {formatDate(item.expirationDate)}
                                    {new Date(item.expirationDate) < new Date() && (
                                        <span className="expired-badge"> (ISTEKLO)</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };


    const SummaryStockTable = () => {
        if (loadingSummaryStock) return <p className="loading-text">Učitavanje stanja zaliha...</p>;
        if (errorSummaryStock) return <p className="error-text">❌ {errorSummaryStock}</p>; 
        if (summaryStockData.length === 0) return <p className="no-data-text">Nema artikala na stanju.</p>;

        return (
            <div className="risk-table-container"> 
                <table className="risk-table">
                    <thead>
                        <tr>
                            <th>Naziv Stavke</th>
                            <th>Količina</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summaryStockData.map((item, index) => (
                            // Pretpostavljamo da DTO ima polja 'itemName' i 'totalQuantity'
                            <tr key={index}>
                                <td className="font-semibold">{item.itemName}</td>
                                <td>{item.totalQuantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };


    const OrderedChartDisplay = () => {
        if (loadingOrdered) return <p className="loading-text">Učitavanje top naručivanja...</p>;
        if (errorOrdered) return <p className="error-text">❌ {errorOrdered}</p>;
        if (topItemsData.length === 0) return <p className="no-data-text">Nema podataka o naručenim stavkama.</p>;

        const barColor = '#3B82F6'; 
        const axisColor = '#64748B';

        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={topItemsData} 
                    layout="vertical" 
                    margin={{ top: 20, right: 30, left: 70, bottom: 5 }} 
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke={axisColor} 
                        fontSize={12} 
                        axisLine={false} 
                        tickLine={false}
                    />
                    <XAxis 
                        dataKey="orders" 
                        type="number" 
                        stroke={axisColor} 
                        fontSize={12} 
                        tickFormatter={(value) => Math.round(value)} 
                    />
                    <Tooltip 
                        formatter={(value, name) => [`Broj porudžbina: ${value}`, null]} 
                        labelFormatter={(label) => `Stavka: ${label}`}
                    />
                    <Bar dataKey="orders" fill={barColor} radius={[5, 5, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const ExpiredChartDisplay = () => {
        if (loadingExpired) return <p className="loading-text">Učitavanje otpisanih stavki...</p>;
        if (errorExpired) return <p className="error-text">❌ {errorExpired}</p>;
        if (topExpiredData.length === 0) return <p className="no-data-text">Nema podataka o otpisanim stavkama.</p>;

        const barColor = '#EF4444'; 
        const axisColor = '#64748B';

        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={topExpiredData} 
                    layout="vertical" 
                    margin={{ top: 20, right: 30, left: 70, bottom: 5 }} 
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#FEE2E2" />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke={axisColor} 
                        fontSize={12} 
                        axisLine={false} 
                        tickLine={false}
                    />
                    <XAxis 
                        dataKey="count" 
                        type="number" 
                        stroke={axisColor} 
                        fontSize={12} 
                        tickFormatter={(value) => Math.round(value)} 
                    />
                    <Tooltip 
                        formatter={(value, name) => [`Broj otpisa: ${value}`, null]} 
                        labelFormatter={(label) => `Stavka: ${label}`}
                    />
                    <Bar dataKey="count" fill={barColor} radius={[5, 5, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    };
    
    const AnalitikaCard = ({ title, subtitle, children }) => (
        <div className="analitika-card">
            <div className="card-header-text">
                <p className="card-title">{title}</p>
                <p className="card-subtitle">{subtitle}</p>
            </div>
            <div className="card-content">
                {children}
            </div>
        </div>
    );


    return (
        <div className="medicaments-page">
            <div className="medicaments-header">
                <div className="brand-section">
                    <div className="brand-text">
                        <p className="pet-clinic-title">PetClinic</p>
                        <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
                    </div>
                </div>
                <div className="user-section">
                    <button className="logout-btn" onClick={handleLogout}>
                        Log out
                    </button>
                </div>
            </div>

            <div className="medicaments-content">
                <div className="content-header">
                    <button className="back-btn" onClick={handleBackToDashboard}>
                        ← Nazad na Dashboard
                    </button>
                    <h1>Analitika Zaliha i Naručivanja</h1>
                    <p>Detaljan pregled ključnih metrika</p>
                </div>
                
                <div className="analytics-row top-row">
                    
                    <AnalitikaCard 
                        title="Najčešće poručivane stavke" 
                        subtitle="Top 5 stavki po broju porudžbina"
                    >
                        <OrderedChartDisplay />
                    </AnalitikaCard>
                    
                    <AnalitikaCard 
                        title="Zalihe pod rizikom od isteka" 
                        subtitle="Stavke koje ističu u narednih 30 dana ili su već istekle"
                    >
                        <ExpirationRiskTable /> 
                    </AnalitikaCard>
                </div>

                <div className="analytics-row bottom-row">
                    
                    <AnalitikaCard 
                        title="Top Otpisane Stavke" 
                        subtitle="Top 5 stavki otpisane zbog isteka roka trajanja"
                    >
                        <ExpiredChartDisplay />
                    </AnalitikaCard>
                    
                    <AnalitikaCard 
                        title="Sumarno Stanje Zaliha" 
                        subtitle="Ukupna količina artikala na stanju"
                    >
                        <SummaryStockTable /> 
                    </AnalitikaCard>
                </div>
            
            </div>
        </div>
    );
};
export default MedicamentsPage;