<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Validasi dasar
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'current_password' => 'required_if:email_changed,true',
        ]);

        $emailChanged = $request->email !== $user->email;

        if ($emailChanged) {
            if (!$request->current_password || !Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kata sandi saat ini salah. Tidak dapat mengubah email.'
                ], 403);
            }
            $user->email = $request->email;
        }

        $user->name = $request->name;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user->load('role')
        ]);
    }
}
