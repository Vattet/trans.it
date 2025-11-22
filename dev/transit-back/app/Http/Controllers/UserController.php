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
     *     security={{"bearerAuth":{}}},
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
     *         description="Utilisateur créé avec succès"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erreur lors de la création"
     *     )
     * )
     */
    public function store(Request $request)
    {
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

        $status = UserHelper::InsertUser($validated);

        return response()->json(['status' => $status], $status === 'success' ? 201 : 400);
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
}
