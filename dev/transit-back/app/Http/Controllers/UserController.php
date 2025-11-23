<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\UserHelper;

class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/users",
     *     summary="Récupérer tous les utilisateurs",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Liste complète des utilisateurs"
     *     )
     * )
     */
    public function getAll()
    {
        $users = UserHelper::GetAllUser();

        return response()->json($users);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{id}",
     *     summary="Récupère un utilisateur via son ID",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Utilisateur trouvé"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Utilisateur non trouvé"
     *     )
     * )
     */
    public function show($id)
    {
        $user = UserHelper::GetUserById($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    /**
     * @OA\Post(
     *     path="/api/users",
     *     summary="Créer un nouvel utilisateur",
     *     tags={"Users"},
     * 
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"Nom","Prenom","Email","Mot_de_passe"},
     *             @OA\Property(property="Nom", type="string", example="Dupont"),
     *             @OA\Property(property="Prenom", type="string", example="Jean"),
     *             @OA\Property(property="Email", type="string", example="jean.dupont@example.com"),
     *             @OA\Property(property="Mot_de_passe", type="string", example="secret123"),
     *             @OA\Property(property="IsActive", type="boolean", example=true)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Utilisateur créé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="User created successfully.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation (par exemple Email déjà utilisé)",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="validation_error"),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 example={
     *                     "Email": {"The email has already been taken."}
     *                 }
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="Erreur lors de la création de l'utilisateur",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Unable to create user.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Erreur serveur",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Server error")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'Nom' => 'required|string|max:100',
                'Prenom' => 'required|string|max:100',
                'Email' => 'required|email|max:255',
                'Mot_de_passe' => 'required|string|min:4',
                'IsActive' => 'boolean',
            ]);

            $validated['Date_Creation'] = now();
            $validated['Date_Update'] = now();
            $validated['Mot_de_passe'] = bcrypt($validated['Mot_de_passe']);

            $user = UserHelper::GetUserByEmail($validated['Email']);
            if ($user) {
                return response()->json([
                    'status' => 'validation_error',
                    'errors' => [
                        'Email' => ['The email has already been taken.']
                    ]
                ], 422);
            }

            $status = UserHelper::InsertUser($validated);

            if ($status !== 'success') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unable to create user.',
                ], 400);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'User created successfully.',
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([
                'status' => 'validation_error',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {

            return response()->json([
                'status' => 'error',
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }


    /**
     * @OA\Put(
     *     path="/api/users/{id}",
     *     summary="Mettre à jour un utilisateur",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="Nom", type="string", example="Martin"),
     *             @OA\Property(property="Prenom", type="string", example="Paul"),
     *             @OA\Property(property="Email", type="string", example="paul.martin@example.com"),
     *             @OA\Property(property="Mot_de_passe", type="string", example="newpassword123"),
     *             @OA\Property(property="IsActive", type="boolean", example=false)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Utilisateur mis à jour"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erreur lors de la mise à jour"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'Nom' => 'sometimes|string|max:100',
            'Prenom' => 'sometimes|string|max:100',
            'Email' => 'sometimes|email|max:255',
            'Mot_de_passe' => 'sometimes|string|min:4',
            'IsActive' => 'sometimes|boolean',
        ]);

        if (isset($validated['Mot_de_passe'])) {
            $validated['Mot_de_passe'] = bcrypt($validated['Mot_de_passe']);
        }

        $validated['Date_Update'] = now();

        $status = UserHelper::UpdateUserById($id, $validated);

        if ($status === "error") {
            return response()->json(['message' => 'Update failed'], 400);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * @OA\Delete(
     *     path="/api/users/{id}",
     *     summary="Supprimer un utilisateur",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Utilisateur supprimé"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erreur lors de la suppression"
     *     )
     * )
     */
    public function destroy($id)
    {
        $status = UserHelper::DeleteUserById($id);

        if ($status === "error") {
            return response()->json(['message' => 'Delete failed'], 400);
        }

        return response()->json(['status' => 'success']);
    }

    public function login(Request $request)
    {
        $request->validate([
            'Email' => 'required|email',
            'Mot_de_passe' => 'required'
        ]);

        // Chercher l'utilisateur
        $user = UserHelper::GetUserByEmail($request['Email']);
        if (!$user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Vérifier mot de passe
        if (!password_verify($request->Mot_de_passe, $user->Mot_de_passe)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Générer un token
        $token = $user->createToken("api")->plainTextToken;

        return response()->json([
            'message' => 'success',
            'token' => $token,
            'user' => $user
        ]);
    }

}
