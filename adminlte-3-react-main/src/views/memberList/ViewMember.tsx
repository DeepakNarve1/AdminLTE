"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import {
  User,
  MapPin,
  Calendar,
  Twitter,
  Instagram,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

interface IMember {
  _id: string;
  block: string;
  year: string;
  vehicle: string;
  samiti: string;
  code: string;
  instagram: string;
  twitter: string;
  startLat: number;
  startLong: number;
  startDate: string;
  endLat: number;
  endLong: number;
  endDate: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

const ViewMember = () => {
  const router = useRouter();
  const { id } = useParams();
  const [member, setMember] = useState<IMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:5000/api/members/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMember(data.data);
      } catch (error) {
        toast.error("Failed to load member details");
        router.push("/member-list");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMember();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!member) return <div>Member not found</div>;

  return (
    <RouteGuard requiredPermissions={["view_members"]}>
      <ContentHeader title="View Member" />
      <section className="content">
        <div className="container-fluid px-4">
          <Card className="max-w-4xl mx-auto shadow-lg border border-gray-200 mt-6">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    Member Details
                    <Badge className="bg-blue-600 ml-2">{member.code}</Badge>
                  </CardTitle>
                  <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {member.block}
                  </p>
                </div>
                <div className="text-right">
                  <Button variant="outline" onClick={() => router.back()}>
                    Back
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" /> Basic Info
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Block</Label>
                      <p className="font-medium text-gray-900">
                        {member.block}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Year</Label>
                      <p className="font-medium text-gray-900">{member.year}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Vehicle</Label>
                      <p className="font-medium text-gray-900">
                        {member.vehicle}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Samiti</Label>
                      <p className="font-medium text-gray-900">
                        {member.samiti}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Code</Label>
                      <p className="font-medium text-gray-900">{member.code}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-gray-500" /> Social &
                    Media
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      <span className="font-medium">
                        {member.instagram || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">
                        {member.twitter || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gray-600" />
                      <span className="font-medium break-all">
                        {member.image || "No Image"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" /> Start Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Start Date</Label>
                      <p className="font-medium text-gray-900">
                        {member.startDate
                          ? new Date(member.startDate).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="col-span-2 flex gap-4">
                      <div>
                        <Label className="text-gray-500">Lat</Label>
                        <p className="font-medium text-gray-900">
                          {member.startLat}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Long</Label>
                        <p className="font-medium text-gray-900">
                          {member.startLong}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" /> End Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">End Date</Label>
                      <p className="font-medium text-gray-900">
                        {member.endDate
                          ? new Date(member.endDate).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="col-span-2 flex gap-4">
                      <div>
                        <Label className="text-gray-500">Lat</Label>
                        <p className="font-medium text-gray-900">
                          {member.endLat}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Long</Label>
                        <p className="font-medium text-gray-900">
                          {member.endLong}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </RouteGuard>
  );
};

export default ViewMember;
