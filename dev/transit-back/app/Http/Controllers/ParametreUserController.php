<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Parametre_UserHelper;

class ParametreUserController extends Controller
{
    /** GET param by param ID */
    public function getById($id)
    {
        $param = Parametre_UserHelper::GetParameterById($id);

        if (!$param) {
            return response()->json(['error' => 'Paramètre introuvable'], 404);
        }

        return response()->json($param);
    }

    /** GET param by user ID */
    public function getByUserId($userId)
    {
        $param = Parametre_UserHelper::GetParameterByUserId($userId);

        if (!$param) {
            return response()->json(['error' => 'Aucun paramètre pour cet utilisateur'], 404);
        }

        return response()->json($param);
    }

    /** CREATE */
    public function store(Request $request)
    {
        $request->validate([
            'Id_User' => 'required|integer',
            'Notification_Mail' => 'boolean',
            'Langue' => 'string|max:10'
        ]);

        $data = [
            'Notification_Mail' => $request->input('Notification_Mail', false), // false par défaut
            'Langue' => $request->input('Langue', 'fr'),             // 'fr' par défaut
        ];

        try {
            $param = Parametre_UserHelper::CreateOrUpdate($request->Id_User, $data);

            return response()->json($param, 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur lors de la sauvegarde des paramètres',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->merge(['Id_User' => $id]);
        return $this->store($request);
    }
    /** DELETE by parameter ID */
    public function deleteByParamId($id)
    {
        $status = Parametre_UserHelper::DeleteParameterById($id);

        if ($status === "not_found") {
            return response()->json(['error' => 'Paramètre introuvable'], 404);
        }

        return response()->json(['status' => 'deleted']);
    }

    /** DELETE by user ID */
    public function deleteByUserId($userId)
    {
        $status = Parametre_UserHelper::DeleteParameterByUserId($userId);

        if ($status === "not_found") {
            return response()->json(['error' => 'Aucun paramètre trouvé pour cet utilisateur'], 404);
        }

        return response()->json(['status' => 'deleted']);
    }
}
