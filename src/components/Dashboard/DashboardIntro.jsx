import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../../services/newUserService';
import { fetchDashboardSummary } from '../../services/dashboardService';
import { handleErrors } from '../../utils/errorHandler';

const STAT_CONFIG = [
    {
        key: 'totalAppUsers',
        label: 'App Users',
        icon: 'ri-user-3-line',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        accent: '#6366f1',
    },
    {
        key: 'totalSavedSearches',
        label: 'Saved Searches',
        icon: 'ri-search-line',
        gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        accent: '#22c55e',
    },
    {
        key: 'totalCategories',
        label: 'Categories',
        icon: 'ri-price-tag-3-line',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        accent: '#f59e0b',
    },
    {
        key: 'totalSharedLocations',
        label: 'Shared Locations',
        icon: 'ri-map-pin-2-line',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        accent: '#06b6d4',
    },
];

export const DashboardIntro = () => {
    const [userName, setUserName] = useState();
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await fetchUserProfile();

                if (userData.data.result.userRole === 1) {
                    setUserName(userData.data.result.userName);
                } else if (userData.data.result.id === 96) {
                    setUserName(userData.data.result.userName);
                } else {
                    setUserName(userData.data.result.userName);
                    navigate('/user-dashboard');
                }
            } catch (error) {
                handleErrors(error);
            }
        };

      const fetchStats = async () => {
    try {
        const res = await fetchDashboardSummary();
        console.log('dashboard summary response:', res); // remove after confirming
        if (res.isSuccess) {
            setStats(res.result);
        }
    } catch (error) {
        handleErrors(error);
    } finally {
        setStatsLoading(false);
    }
};
        fetchUserData();
        fetchStats();
    }, [navigate]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) {
            return 'Good Morning';
        } else if (hour < 18) {
            return 'Good Afternoon';
        } else {
            return 'Good Evening';
        }
    };

    return (
        <>
            <div className="row mb-3 pb-1">
                <div className="col-12">
                    <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                        <div className="flex-grow-1">
                            {userName && (
                                <>
                                    <h4 className="fs-16 mb-1">{getGreeting()}, {userName}!</h4>
                                    <p className="text-muted mb-0">Here's what's happening with your store today.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-3">
                {STAT_CONFIG.map((card) => (
                    <div className="col-xl-3 col-md-6" key={card.key}>
                        <div
                            className="card border-0 h-100"
                            style={{
                                borderRadius: '14px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                                borderTop: `3px solid ${card.accent}`,
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
                            }}
                        >
                            <div className="card-body p-3">
                                <div className="d-flex align-items-start justify-content-between mb-3">
                                    <span
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: card.gradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 4px 10px ${card.accent}40`,
                                        }}
                                    >
                                        <i className={`${card.icon} text-white fs-4`}></i>
                                    </span>
                                </div>

                                <p
                                    className="text-uppercase text-muted mb-1"
                                    style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em' }}
                                >
                                    {card.label}
                                </p>

                                <h3 className="fw-bold mb-0" style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>
                                    {statsLoading ? (
                                        <span className="placeholder-glow">
                                            <span className="placeholder col-4"></span>
                                        </span>
                                    ) : (
                                        (stats?.[card.key] ?? 0).toLocaleString()
                                    )}
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};