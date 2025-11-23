"use client";

import { useState, useEffect } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  function getCookie(name: string) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
  }

  useEffect(() => {
    const t = getCookie("token");
    const u = localStorage.getItem("user");

    setToken(t);
    setUser(u ? JSON.parse(u) : null);
    setLoading(false);
  }, []);

  return { token, user, loading };
}
