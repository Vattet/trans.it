<?php

namespace App\Helpers;

use App\Models\ParametreDocument;
use Carbon\Carbon;

class Parametre_DocumentHelper
{
    /** CREATE */
    public static function InsertParamDoc($data)
    {
        try {
            return ParametreDocument::create([
                'Id_Document' => $data['Id_Document'], // ⚠️ INDISPENSABLE
                'Protection_MotDePasse' => $data['Protection_MotDePasse'] ?? false,
                'Mot_de_passe' => $data['Mot_de_passe'] ?? null,
                'Date_Expiration' => isset($data['Date_Expiration']) ? Carbon::parse($data['Date_Expiration']) : null,
                'Date_Update' => Carbon::now(),
                'Date_Creation' => Carbon::now(),
            ]);
        } catch (\Exception $e) {
            return null;
        }
    }

    /** READ */
    public static function GetParameterByDocId(int $idDocument)
    {
        return ParametreDocument::where('Id_Document', $idDocument)->first();
    }
    public static function GetParamByUserId(int $userId)
    {
        return ParametreDocument::where('Id_User', $userId)->first();
    }
    /** UPDATE */
    public static function UpdateParamById(int $id, array $data)
    {
        try {
            $param = ParametreDocument::find($id);

            if (!$param)
                return "not_found";

            $param->update([
                'Protection_MotDePasse' => $data['Protection_MotDePasse'] ?? $param->Protection_MotDePasse,
                'Mot_de_passe' => $data['Mot_de_passe'] ?? $param->Mot_de_passe,
                'Date_Expiration' => $data['Date_Expiration'] ?? $param->Date_Expiration,
                'Date_Update' => Carbon::now(),
            ]);

            return "success";

        } catch (\Exception $e) {
            return "error";
        }
    }

    /** DELETE */
    public static function DeleteById(int $id)
    {
        $param = ParametreDocument::find($id);

        if (!$param)
            return "not_found";

        $param->delete();
        return "success";
    }
}
