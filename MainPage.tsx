
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Video, Server, Settings,
    Shield, CheckCircle, AlertTriangle, Cloud,
    ArrowRight, Activity, Clock, Database, Lock,
    Megaphone, FileText, ChevronRight
} from 'lucide-react';

const MainPage = () => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const menuCards = [
        {
            title: "시스템 현황",
            description: "전체 시스템의 상태와 주요 지표를 한눈에 파악합니다.",
            icon: LayoutDashboard,
            path: "/design3",
            tab: "dashboard",
            color: "from-blue-500 to-indigo-600",
            lightColor: "bg-blue-50 text-blue-600"
        },
        {
            title: "서버별 현황",
            description: "각 서버의 세부 상태와 리소스 사용량을 모니터링합니다.",
            icon: Activity,
            path: "/design3",
            tab: "server",
            color: "from-emerald-500 to-teal-600",
            lightColor: "bg-emerald-50 text-emerald-600"
        },
        {
            title: "영상 보기",
            description: "실시간 CCTV 영상을 그리드 형태로 조회하고 제어합니다.",
            icon: Video,
            path: "/design3",
            tab: "cctv",
            color: "from-violet-500 to-purple-600",
            lightColor: "bg-violet-50 text-violet-600"
        },
        {
            title: "관리",
            description: "장비 관리, 사용자 설정 및 시스템 환경을 구성합니다.",
            icon: Settings,
            path: "/design3",
            tab: "management",
            color: "from-slate-600 to-slate-800",
            lightColor: "bg-slate-50 text-slate-600"
        }
    ];

    const systemStatus = [
        { label: "카메라 가동률", value: "98.5%", status: "normal", icon: Video },
        { label: "서버 부하율", value: "42.0%", status: "normal", icon: Activity },
        { label: "저장소 사용량", value: "76.4%", status: "warning", icon: Database },
        { label: "네트워크 상태", value: "정상", status: "normal", icon: Cloud },
    ];

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
            {/* Header / Hero Section */}
            <div className="bg-white border-b border-slate-200 shrink-0">
                <div className="max-w-[1800px] mx-auto px-8 py-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <img src="/ci.svg" alt="logo" className="h-8" />
                                <span className="text-xl font-bold text-slate-800">한국도로공사</span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mt-4">
                                안녕하세요, <span className="text-blue-600">관리자님</span>
                            </h1>
                            <p className="text-slate-500 mt-2">
                                CCTV 통합 관제 시스템에 접속하셨습니다.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full mb-3">
                                <Clock size={18} className="text-slate-500" />
                                <span className="text-slate-700 font-medium font-mono">
                                    {currentTime.toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="text-sm text-slate-500">
                                {currentTime.toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Quick Status Bar */}
                    <div className="grid grid-cols-4 gap-6">
                        {systemStatus.map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className={`p-3 rounded-lg ${stat.status === 'normal' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 mb-1">{stat.label}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-slate-800">{stat.value}</span>
                                        {stat.status === 'normal' ? (
                                            <CheckCircle size={14} className="text-green-500" />
                                        ) : (
                                            <AlertTriangle size={14} className="text-orange-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Menu Grid */}
            <div className="flex-1 max-w-[1800px] mx-auto px-8 py-8 w-full flex flex-col min-h-0">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
                    <LayoutDashboard className="text-slate-400" size={24} />
                    주요 서비스
                </h2>

                <div className="grid grid-cols-4 gap-6 shrink-0 h-64 mb-6">
                    {menuCards.map((card, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(card.path, { state: { tab: card.tab } })}
                            className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex-1">
                                    <div className={`inline-flex p-3 rounded-2xl mb-4 ${card.lightColor} group-hover:scale-110 transition-transform duration-300`}>
                                        <card.icon size={28} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-slate-500 leading-relaxed max-w-md">
                                        {card.description}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Info Section */}
                <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                    {/* Recent Alerts (Simplified) */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-orange-500" />
                                최근 시스템 알림
                            </h3>
                            <button className="text-sm text-slate-400 hover:text-slate-600">더보기</button>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar space-y-2 pr-2">
                            {[1, 2, 3, 4, 5, 6].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-800 truncate">분당 센터 영상 서버 #03 응답 지연</div>
                                        <div className="text-xs text-slate-400 mt-0.5">2024-12-15 14:2{i}</div>
                                    </div>
                                    <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded">확인 필요</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notices Section */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Megaphone size={20} className="text-blue-500" />
                                공지사항
                            </h3>
                            <button className="text-sm text-slate-400 hover:text-slate-600">더보기</button>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar pr-2">
                            <div className="space-y-1">
                                {[
                                    { title: "시스템 정기 점검 안내 (12/20)", date: "2024-12-15", type: "notice" },
                                    { title: "동절기 CCTV 관리 수칙 배포", date: "2024-12-12", type: "file" },
                                    { title: "보안 패치 적용 완료 (v2.4.1)", date: "2024-12-10", type: "notice" },
                                    { title: "신규 관제 요원 직무 교육 일정", date: "2024-12-08", type: "notice" },
                                    { title: "네트워크 장비 교체 작업 예정", date: "2024-12-05", type: "notice" },
                                ].map((notice, i) => (
                                    <div key={i} className="group flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-3 rounded-lg transition-colors cursor-pointer">
                                        <div className={`p-2 rounded-lg shrink-0 ${notice.type === 'notice' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {notice.type === 'notice' ? <Megaphone size={16} /> : <FileText size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">{notice.title}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{notice.date}</div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
