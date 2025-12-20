"use client";

import { DEFAULT_AVATARS } from "@/src/domain/types/user";
import { MainLayout } from "@/src/presentation/components/layout/MainLayout";
import { useUserStore } from "@/src/presentation/stores/userStore";
import { ArrowLeft, Calendar, Check, Edit2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Profile View Component
 * Presentational component for user profile page
 */
export function ProfileView() {
  const router = useRouter();
  const { user, isHydrated, updateUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form values when user loads
  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
      setSelectedAvatar(user.avatar);
    }
  }, [user]);

  // Redirect to setup if no user
  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/setup");
    }
  }, [isHydrated, user, router]);

  // Handle save
  const handleSave = async () => {
    if (!nickname.trim()) return;

    setIsSaving(true);

    // Simulate a small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    updateUser({
      nickname: nickname.trim(),
      avatar: selectedAvatar,
    });

    setIsSaving(false);
    setIsEditing(false);
  };

  // Handle cancel
  const handleCancel = () => {
    if (user) {
      setNickname(user.nickname);
      setSelectedAvatar(user.avatar);
    }
    setIsEditing(false);
  };

  // Loading state
  if (!isHydrated || !user) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted">กำลังโหลด...</div>
        </div>
      </MainLayout>
    );
  }

  // Format date
  const createdDate = new Date(user.createdAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <MainLayout>
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </Link>

          {/* Profile Card */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-info/20 to-primary/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-2xl bg-background flex items-center justify-center text-4xl shadow-lg">
                    {isEditing ? selectedAvatar : user.avatar}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {isEditing ? nickname || "ชื่อเล่น" : user.nickname}
                    </h1>
                    <div className="flex items-center gap-2 text-muted text-sm mt-1">
                      <User className="w-4 h-4" />
                      <span>ID: {user.id.slice(0, 15)}...</span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-info text-white hover:bg-info/90 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">แก้ไข</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-6">
                  {/* Nickname Field */}
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      ชื่อเล่น
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={20}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-info focus:ring-2 focus:ring-info/20 outline-none transition-all text-lg"
                      placeholder="ใส่ชื่อเล่นของคุณ"
                      autoFocus
                    />
                    <p className="text-xs text-muted mt-1">
                      {nickname.length}/20 ตัวอักษร
                    </p>
                  </div>

                  {/* Avatar Selection */}
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      เลือกอวาตาร์
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {DEFAULT_AVATARS.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                            selectedAvatar === avatar
                              ? "bg-info/20 border-2 border-info scale-110"
                              : "bg-background border border-border hover:border-info/50 hover:scale-105"
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-3 rounded-xl border border-border text-muted hover:bg-muted-light dark:hover:bg-muted-dark transition-colors font-medium"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!nickname.trim() || isSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-info text-white hover:bg-info/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          บันทึก
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-background border border-border">
                      <div className="text-muted text-sm">สร้างเมื่อ</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-info" />
                        <span className="font-medium">{createdDate}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-background border border-border">
                      <div className="text-muted text-sm">สถานะ</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="font-medium text-success">ออนไลน์</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-muted mb-3">
                      ลิงก์ด่วน
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/games"
                        className="px-4 py-2 rounded-xl bg-info/10 text-info hover:bg-info/20 transition-colors text-sm font-medium"
                      >
                        🎮 เล่นเกม
                      </Link>
                      <Link
                        href="/"
                        className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                      >
                        🏠 หน้าแรก
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
