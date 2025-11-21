<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lien extends Model
{
    protected $table = 'Lien';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'Id_Document',
        'Code_unique',
        'URL',
        'Nb_Acces',
        'IsActive',
        'Date_Expiration',
        'Date_Creation',
    ];

    protected $casts = [
        'Nb_Acces' => 'integer',
        'IsActive' => 'boolean',
        'Date_Expiration' => 'datetime',
        'Date_Creation' => 'datetime',
    ];

    // Relations
    public function document()
    {
        return $this->belongsTo(Document::class, 'Id_Document', 'ID');
    }

    public function historiques()
    {
        return $this->hasMany(Historique::class, 'Id_Lien', 'ID');
    }
}
