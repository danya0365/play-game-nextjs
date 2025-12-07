"use client";

import { DEFAULT_AVATARS, getRandomAvatar } from "@/src/domain/types/user";
import { useUserStore } from "@/src/presentation/stores/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Edit2, Gamepad2, RefreshCw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

/**
 * Form validation schema
 */
const setupSchema = z.object({
  nickname: z
    .string()
    .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(20, "ชื่อต้องไม่เกิน 20 ตัวอักษร")
    .regex(/^[a-zA-Z0-9ก-๙\s]+$/, "ชื่อต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น"),
  avatar: z.string().min(1, "กรุณาเลือก avatar"),
});

type SetupFormData = z.infer<typeof setupSchema>;

/**
 * Setup View Component
 * User profile creation/editing
 */
export function SetupView() {
  const router = useRouter();
  const { user, isHydrated, createUser, updateUser } = useUserStore();
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      nickname: "",
      avatar: "",
    },
  });

  // Set initial values when user data is available
  useEffect(() => {
    if (isHydrated) {
      if (user) {
        setValue("nickname", user.nickname);
        setValue("avatar", user.avatar);
        setSelectedAvatar(user.avatar);
      } else {
        const randomAvatar = getRandomAvatar();
        setValue("avatar", randomAvatar);
        setSelectedAvatar(randomAvatar);
      }
    }
  }, [isHydrated, user, setValue]);

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setValue("avatar", avatar);
  };

  const handleRandomAvatar = () => {
    const newAvatar = getRandomAvatar();
    handleAvatarSelect(newAvatar);
  };

  const onSubmit = async (data: SetupFormData) => {
    try {
      if (isEditing) {
        updateUser({ nickname: data.nickname, avatar: data.avatar });
      } else {
        createUser({ nickname: data.nickname, avatar: data.avatar });
      }
      router.push("/games");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-info/10 mb-4">
          {isEditing ? (
            <Edit2 className="w-8 h-8 text-info" />
          ) : (
            <Gamepad2 className="w-8 h-8 text-info" />
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {isEditing ? "แก้ไขโปรไฟล์" : "สร้างโปรไฟล์"}
        </h1>
        <p className="text-muted">
          {isEditing
            ? "แก้ไขชื่อและ avatar ของคุณ"
            : "ตั้งชื่อและเลือก avatar เพื่อเริ่มเล่นเกม"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">Avatar</label>

          {/* Selected Avatar Preview */}
          <div className="flex items-center justify-center gap-4 p-6 rounded-xl bg-surface border border-border">
            <span className="text-6xl">{selectedAvatar}</span>
            <button
              type="button"
              onClick={handleRandomAvatar}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted-light dark:bg-muted-dark hover:bg-border transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              สุ่มใหม่
            </button>
          </div>

          {/* Avatar Grid */}
          <div className="grid grid-cols-8 gap-2">
            {DEFAULT_AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => handleAvatarSelect(avatar)}
                className={`aspect-square rounded-lg text-2xl flex items-center justify-center transition-all ${
                  selectedAvatar === avatar
                    ? "bg-info/20 ring-2 ring-info scale-110"
                    : "bg-surface border border-border hover:border-info/50"
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>

          {errors.avatar && (
            <p className="text-sm text-error">{errors.avatar.message}</p>
          )}
        </div>

        {/* Nickname Input */}
        <div className="space-y-2">
          <label htmlFor="nickname" className="block text-sm font-medium">
            ชื่อเล่น
          </label>
          <input
            id="nickname"
            type="text"
            placeholder="ใส่ชื่อเล่นของคุณ"
            {...register("nickname")}
            className={`w-full px-4 py-3 rounded-lg border bg-surface focus:outline-none focus:ring-2 transition-colors ${
              errors.nickname
                ? "border-error focus:ring-error/50"
                : "border-border focus:ring-info/50 focus:border-info"
            }`}
          />
          {errors.nickname && (
            <p className="text-sm text-error">{errors.nickname.message}</p>
          )}
          <p className="text-xs text-muted">
            ชื่อนี้จะแสดงให้เพื่อนเห็นเวลาเล่นเกม
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-info text-white font-semibold hover:bg-info-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>กำลังบันทึก...</span>
            </>
          ) : (
            <>
              {isEditing ? (
                <Check className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <span>
                {isEditing ? "บันทึกการเปลี่ยนแปลง" : "เริ่มเล่นเกม!"}
              </span>
            </>
          )}
        </button>

        {/* Skip Link (only for new users) */}
        {!isEditing && (
          <button
            type="button"
            onClick={() => router.push("/games")}
            className="w-full text-center text-sm text-muted hover:text-foreground transition-colors"
          >
            ข้ามไปดูเกมก่อน
          </button>
        )}
      </form>

      {/* Info Card */}
      <div className="mt-8 p-4 rounded-xl bg-info/5 border border-info/20">
        <h3 className="font-medium text-info mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          ข้อมูลถูกเก็บในเครื่องคุณเท่านั้น
        </h3>
        <p className="text-sm text-muted">
          เราไม่มีระบบสมัครสมาชิก ข้อมูลของคุณจะถูกเก็บไว้ในเบราว์เซอร์
          และจะหายไปเมื่อคุณล้างข้อมูลเว็บไซต์
        </p>
      </div>
    </div>
  );
}
