"use client";

import React, { useState, useEffect } from "react";
import DetailedReportModal from "@/app/components/detailedReport";

export default function DetailsPage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ouac_user_profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    }
  }, []);

  return (
    <DetailedReportModal
      isOpen={true}
      onClose={() => window.history.back()}
      data={profile}
    />
  );
}
