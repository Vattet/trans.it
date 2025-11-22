<?php

namespace App\Helpers;

use App\Models\Document;

class DocumentHelper
{
    public static function GetAllDocument()
    {
        return Document::all();
    }

    public static function GetAllDocumentByUserId($idUser)
    {
        return Document::where('Id_User', $idUser)->get();
    }

    public static function InsertDoc(array $data)
    {
        $document = Document::create($data);

        return $document ? "success" : "error";
    }

    public static function GetDocumentById(int $id)
    {
        return Document::find($id);
    }

    public static function UpdateDocumentById(int $id, array $data)
    {
        $updated = Document::where("ID", $id)->update($data);

        return $updated ? "success" : "error";
    }

    public static function DeleteDocumentById(int $id)
    {
        $deleted = Document::destroy($id);

        return $deleted ? "success" : "error";
    }
}
