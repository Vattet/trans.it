<?php

namespace App\Helpers;

use App\Models\ParametreDocument;

class Parametre_DocumentHelper
{
    public static function InsertParamDoc(array $data)
    {
        // Optionnel : Hachage du mot de passe si présent
        if (isset($data['Mot_de_passe'])) {
            // $data['Mot_de_passe'] = bcrypt($data['Mot_de_passe']); // À décommenter si tu veux hacher ici
        }
        
        $docParam = ParametreDocument::create($data);
        return $docParam ? $docParam : "error";
    }

    public static function GetParameterByDocId(int $docId)
    {
        return ParametreDocument::where('Id_Document', $docId)->first();
    }

    public static function UpdateParamById(int $id, array $data)
    {
        // Attention : $id ici réfère à l'ID du paramètre, pas du document, selon ton UML
        $updated = ParametreDocument::where('ID', $id)->update($data);
        return $updated ? "success" : "error";
    }

    public static function DeleteParameterDocumentById(int $id)
    {
        // destroy renvoie le nombre de lignes supprimées (1 ou 0)
        $deleted = ParametreDocument::destroy($id);
        return $deleted ? "success" : "error";
    }
}