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
            'Notification_Mail' => 'required|boolean',
            'Langue' => 'required|string',
        ]);

        $param = Parametre_UserHelper::InsertParamUser($request->all());

        if (!$param) {
            return response()->json(['error' => 'Erreur création paramètre'], 500);
        }

        return response()->json($param, 201);
    }

    /** UPDATE */
    public function update(Request $request, $userId)
    {
        $status = Parametre_UserHelper::UpdateParameterByUserId($userId, $request->all());

        if ($status === "not_found") {
            return response()->json(['error' => 'Paramètre introuvable'], 404);
        }

        if ($status !== "success") {
            return response()->json(['error' => 'Erreur mise à jour'], 500);
        }

        return response()->json(['status' => 'success']);
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
