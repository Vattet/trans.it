<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * LOGIN (API TOKEN SANCTUM)
     */
    public function login(Request $request)
    {
        $request->validate([
            'Email' => 'required|email',
            'Mot_de_passe' => 'required'
        ]);

        $user = User::where('Email', $request->Email)->first();

        if (!$user || !Hash::check($request->Mot_de_passe, $user->Mot_de_passe)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Génère un token API
        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }
}
