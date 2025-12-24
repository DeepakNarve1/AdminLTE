import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";

import {
  Users,
  UserCheck,
  FileText,
  AlertCircle,
  TrendingUp,
  Clock,
  Shield,
  BarChart3,
} from "lucide-react";
import { ContentHeader } from "@app/components";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalPublicProblems: 0,
    pendingProblems: 0,
    totalProjects: 0,
    completedProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [usersRes, rolesRes, problemsRes, projectsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/rbac/roles", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/public-problems?limit=-1", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/projects?limit=-1", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const users = usersRes.data?.data?.length || 0;
      const roles = rolesRes.data?.data?.length || 0;

      const problems = problemsRes.data?.data || [];
      const totalProblems = problems.length;
      const pending = problems.filter(
        (p: any) => p.status === "Pending"
      ).length;

      const projects = projectsRes.data?.data || [];
      const totalProjects = projects.length;
      const completed = projects.filter(
        (p: any) => p.status === "Completed"
      ).length;

      setStats({
        totalUsers: users,
        totalRoles: roles,
        totalPublicProblems: totalProblems,
        pendingProblems: pending,
        totalProjects: totalProjects,
        completedProjects: completed,
      });
    } catch (err) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      hover: "hover:bg-blue-600",
      description: "Registered system users",
    },
    {
      title: "Active Roles",
      value: stats.totalRoles,
      icon: Shield,
      color: "bg-purple-500",
      hover: "hover:bg-purple-600",
      description: "Defined roles in system",
    },
    {
      title: "Public Problems",
      value: stats.totalPublicProblems,
      icon: FileText,
      color: "bg-[#026e4c]",
      hover: "hover:bg-[#368F8B]",
      description: "Total submitted issues",
    },
    {
      title: "Pending Issues",
      value: stats.pendingProblems,
      icon: AlertCircle,
      color: "bg-yellow-500",
      hover: "hover:bg-yellow-600",
      description: "Awaiting resolution",
    },

    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: BarChart3,
      color: "bg-indigo-500",
      hover: "hover:bg-indigo-600",
      description: "Infrastructure projects",
    },
    {
      title: "Completed Projects",
      value: stats.completedProjects,
      icon: UserCheck,
      color: "bg-teal-500",
      hover: "hover:bg-teal-600",
      description: "Finished works",
    },
  ];

  return (
    <>
      <ContentHeader title="Dashboard" />

      <section className="content">
        <div className="container-fluid px-4">
          {/* Detached Main Block */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                System Overview
              </h2>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's what's happening in your admin panel today.
              </p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-3">
                        <div className="h-6 bg-gray-200 rounded w-32" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-12 bg-gray-200 rounded w-24" />
                        <div className="h-4 bg-gray-200 rounded w-40 mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                  {statCards.map((stat) => (
                    <Card
                      key={stat.title}
                      className="hover:shadow-xl transition-shadow duration-300 border-0"
                    >
                      <CardHeader className="pb-3 border-b-0">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </CardTitle>
                          <div
                            className={`p-2.5 rounded-lg ${stat.color} text-white shadow-lg`}
                          >
                            <stat.icon className="w-5 h-5" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="text-2xl font-bold text-gray-800">
                          {stat.value}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    size="lg"
                    className="bg-[#026e4c] hover:bg-[#368F8B] justify-start shadow-md hover:shadow-lg transition-all"
                    onClick={() => router.push("/users")}
                  >
                    <Users className="mr-3 h-5 w-5" />
                    Manage Users
                  </Button>
                  <Button
                    size="lg"
                    className="bg-[#026e4c] hover:bg-[#368F8B] justify-start shadow-md hover:shadow-lg transition-all"
                    onClick={() => router.push("/roles")}
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    Manage Roles
                  </Button>
                  <Button
                    size="lg"
                    className="bg-[#026e4c] hover:bg-[#368F8B] justify-start shadow-md hover:shadow-lg transition-all"
                    onClick={() => router.push("/mp-public-problems")}
                  >
                    <FileText className="mr-3 h-5 w-5" />
                    MP Public Problems
                  </Button>
                  <Button
                    size="lg"
                    className="bg-[#026e4c] hover:bg-[#368F8B] justify-start shadow-md hover:shadow-lg transition-all"
                    onClick={() => router.push("/project-summary")}
                  >
                    <BarChart3 className="mr-3 h-5 w-5" />
                    Project Summary
                  </Button>
                </div>
              </div>

              {/* Recent Activity Placeholder */}
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Recent Activity
                </h3>
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Activity log coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
