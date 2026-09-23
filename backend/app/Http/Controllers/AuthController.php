<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user()->load('role');
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => $user,
                'token' => $token
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Email atau Password salah'
        ], 401);
    }

    public function user(Request $request)
    {
        return response()->json($request->user()->load(['role', 'pinnedDashboards']));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Logged out']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Gagal mengirim OTP. Pastikan email terdaftar.'], 400);
        }

        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Simpan OTP di Cache selama 5 menit
        \Illuminate\Support\Facades\Cache::put('otp_' . $request->email, $otp, now()->addMinutes(5));

        $spacedOtp = trim(chunk_split($otp, 1, ' '));

        // HTML Email Template
        $html = '
        <div style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1f2937; color: #f9fafb; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <div style="background-color: #6366f1; padding: 25px; text-align: center; border-bottom: 4px solid #4f46e5;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px;">DSS Analytics</h1>
            </div>
            <div style="padding: 40px 30px;">
                <h2 style="margin-top: 0; color: #ffffff; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin-bottom: 30px;">Verifikasi Akun</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; text-align: justify;">Halo <strong>' . htmlspecialchars($user->name) . '</strong>!</p>
                <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; text-align: justify;">Kami telah menerima permintaan untuk mereset kata sandi akun DSS Analytics Anda. Untuk memastikan ini benar-benar Anda, silakan gunakan kode OTP di bawah ini:</p>
                
                <div style="text-align: center; margin: 40px 0;">
                    <div style="display: inline-block; background-color: #374151; border: 2px solid #6366f1; padding: 15px 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.25); text-align: center;">
                        <span style="color: #ffffff; font-size: 32px; font-weight: 900; white-space: nowrap;">' . $spacedOtp . '</span>
                    </div>
                </div>
                
                <p style="font-size: 15px; line-height: 1.6; color: #9ca3af; text-align: center;">Kode OTP ini sangat rahasia dan hanya berlaku selama <strong style="color: #f3f4f6;">5 menit</strong>.</p>
                
                <hr style="border: none; border-top: 1px solid #374151; margin: 30px 0;">
                <p style="font-size: 13px; color: #6b7280; text-align: center; margin: 0; line-height: 1.5;">Jika Anda tidak pernah meminta reset kata sandi, harap abaikan email ini. Jangan pernah memberikan kode OTP kepada siapa pun.</p>
            </div>
        </div>
        ';

        // Kirim email
        \Illuminate\Support\Facades\Mail::html($html, function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('Kode Verifikasi OTP - DSS Analytics');
        });

        return response()->json(['success' => true, 'message' => 'Kode OTP telah dikirim ke email Anda.']);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $cachedOtp = \Illuminate\Support\Facades\Cache::get('otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            return response()->json(['success' => false, 'message' => 'OTP tidak valid atau sudah kadaluarsa.'], 400);
        }

        return response()->json(['success' => true, 'message' => 'OTP valid.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'password' => 'required|min:8|confirmed',
        ]);

        $cachedOtp = \Illuminate\Support\Facades\Cache::get('otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            return response()->json(['success' => false, 'message' => 'OTP tidak valid atau sudah kadaluarsa.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Pengguna tidak ditemukan.'], 404);
        }

        $user->forceFill([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password)
        ])->save();

        \Illuminate\Support\Facades\Cache::forget('otp_' . $request->email);

        return response()->json(['success' => true, 'message' => 'Kata sandi berhasil diatur ulang.']);
    }
}
