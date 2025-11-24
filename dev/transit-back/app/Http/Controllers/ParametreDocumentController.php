<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Parametre_DocumentHelper;
use Illuminate\Support\Facades\Hash;

class ParametreDocumentController extends Controller
{
    public function getById($id)
    {
        $param = Parametre_DocumentHelper::GetParameterByDocId($id);

        if (!$param) {
            return response()->json(['error' => 'Paramètre document introuvable'], 404);
        }

        return response()->json($param);
    }
    public function getByUserId($userId)
    {
        $param = Parametre_DocumentHelper::GetParamByUserId($userId);

        if (!$param) {
            return response()->json(['error' => 'Aucun paramètre document trouvé pour cet utilisateur'], 404);
        }

        return response()->json($param);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Protection_MotDePasse' => 'nullable|boolean',
            'Mot_de_passe' => 'nullable|string',
            'Date_Expiration' => 'nullable|date',
        ]);
        $data = $request->all();

        if (!empty($data['Mot_de_passe'])) {
            $data['Mot_de_passe'] = Hash::make($data['Mot_de_passe']);
            $data['Protection_MotDePasse'] = true;
        } else {
            $data['Mot_de_passe'] = null;
            $data['Protection_MotDePasse'] = false;
        }

        $param = Parametre_DocumentHelper::InsertParamDoc($data);

        if (!$param) {
            return response()->json(['error' => 'Erreur création paramètre'], 500);
        }

        return response()->json($param, 201);
    }

    public function update(Request $request, $id)
    {
        $status = Parametre_DocumentHelper::UpdateParamById($id, $request->all());

        if ($status === "not_found") {
            return response()->json(['error' => 'Paramètre introuvable'], 404);
        }

        if ($status !== "success") {
            return response()->json(['error' => 'Erreur mise à jour'], 500);
        }

        return response()->json(['status' => 'success']);
    }

    public function delete($id)
    {
        $status = Parametre_DocumentHelper::DeleteById($id);

        if ($status === "not_found") {
            return response()->json(['error' => 'Paramètre introuvable'], 404);
        }

        return response()->json(['status' => 'deleted']);
    }
}
