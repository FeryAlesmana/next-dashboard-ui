"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";

interface UserProfile {
  name: string;
  img: string;
  role: string;
}

export default function NavbarContainer({
  onToggleMenu,
}: {
  onToggleMenu: () => void;
}) {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Loading...",
    img: "/avatar.png",
    role: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    };
    fetchProfile();
  }, []);

  return <Navbar onToggleMenu={onToggleMenu} userProfile={userProfile} />;
}
