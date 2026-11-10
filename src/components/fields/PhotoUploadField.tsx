import React, { useRef, useState } from 'react';
import { UploadedPhoto } from '../../types/questionnaire';
import { Upload, Trash2, AlertOctagon, FileText, Image as ImageIcon, Edit2, Check, X } from 'lucide-react';

interface PhotoUploadFieldProps {
  photos: UploadedPhoto[] | undefined;
  onChange: (photos: UploadedPhoto[]) => void;
}

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  photos = [],
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotosList: UploadedPhoto[] = [...photos];
    let loadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        newPhotosList.push({
          id: 'file_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          category: isImage ? 'image' : 'document',
          dataUrl,
          uploadedAt: new Date().toISOString(),
        });

        loadedCount++;
        if (loadedCount === totalFiles) {
          onChange(newPhotosList);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (fileId: string) => {
    onChange(photos.filter((p) => p.id !== fileId));
  };

  const startRename = (file: UploadedPhoto) => {
    setEditingId(file.id);
    setEditingName(file.name);
  };

  const saveRename = (fileId: string) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }
    const updated = photos.map((p) => {
      if (p.id === fileId) {
        let finalName = editingName.trim();
        // Conserver l'extension originale si omise
        const originalExt = p.name.includes('.') ? p.name.substring(p.name.lastIndexOf('.')) : '';
        if (originalExt && !finalName.toLowerCase().endsWith(originalExt.toLowerCase())) {
          finalName += originalExt;
        }
        return { ...p, name: finalName };
      }
      return p;
    });
    onChange(updated);
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingName('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  };

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Consigne de renommage OBLIGATOIRE EN ROUGE BIEN VISIBLE ET 100% RESPONSIVE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-red-50/95 border-2 sm:border-3 border-red-500 shadow-md">
        <div className="flex items-start gap-3">
          <AlertOctagon className="w-6 h-6 sm:w-7 sm:h-7 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-black text-red-900 uppercase tracking-tight leading-snug">
              ⚠️ IMPORTANT : RENOMME TES FICHIERS AVANT DE LES IMPORTER !
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-red-800 mt-1 leading-relaxed">
              Ne transmets pas de fichiers nommés <span className="inline-block bg-red-200/90 text-red-950 px-1.5 py-0.5 rounded font-mono text-[11px]">IMG_001.jpg</span> ou <span className="inline-block bg-red-200/90 text-red-950 px-1.5 py-0.5 rounded font-mono text-[11px]">Document_1.pdf</span>.
            </p>
          </div>
        </div>

        {/* Bloc d'exemples avec retour à la ligne garanti (flex-wrap) */}
        <div className="mt-3 p-3 sm:p-3.5 rounded-xl bg-white/90 border border-red-200 text-red-950 space-y-2.5">
          <p className="font-extrabold text-xs uppercase tracking-wider text-red-900">
            Exemples de renommage conseillés pour Traiteur Annie :
          </p>

          <div className="space-y-2 text-xs">
            {/* Plats */}
            <div>
              <span className="font-bold text-stone-700 text-[11px] block mb-1">🍲 Plats & Spécialités :</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-200 break-all">Plat_Eru.jpg</span>
                <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-200 break-all">Plat_Ndole.jpg</span>
                <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-200 break-all">Poulet_DG.jpg</span>
              </div>
            </div>

            {/* Menus */}
            <div>
              <span className="font-bold text-stone-700 text-[11px] block mb-1">📋 Menus & Cartes :</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-200 break-all">Menu_1.pdf</span>
                <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-200 break-all">Menu_2.pdf</span>
                <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-200 break-all">Carte_Tarifs.pdf</span>
              </div>
            </div>

            {/* Matériel */}
            <div>
              <span className="font-bold text-stone-700 text-[11px] block mb-1">🪑 Matériel de Réception :</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-200 break-all">Chaises_Napoleon.jpg</span>
                <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-200 break-all">Tables_Rondes.jpg</span>
              </div>
            </div>

            {/* Entreprise */}
            <div>
              <span className="font-bold text-stone-700 text-[11px] block mb-1">🏢 Entreprise & Histoire :</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-200 break-all">Histoire_Annie.docx</span>
                <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-200 break-all">Presentation.pdf</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] sm:text-xs text-red-700 font-semibold mt-2.5 leading-snug">
          💡 Astuce : tu peux également corriger ou renommer ton fichier directement ci-dessous avec le bouton crayon après l'import.
        </p>
      </div>

      {/* 2. Zone d'import tactile pour Photos (.png, .jpeg, .jpg, .webp) et Documents (.pdf, .doc, .docx, .txt) */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,.pdf,.doc,.docx,.txt"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="photo-file-upload-input"
        />

        <label
          htmlFor="photo-file-upload-input"
          className="min-h-[110px] flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-400 bg-amber-50/40 hover:bg-amber-100/50 rounded-2xl cursor-pointer transition text-center shadow-xs"
        >
          <Upload className="w-8 h-8 text-amber-700 mb-2" />
          <span className="text-sm font-bold text-amber-950">
            Touchez ici pour choisir vos photos ou documents
          </span>
          <span className="text-xs text-stone-600 mt-1">
            Photos (PNG, JPEG, WEBP) ou Documents (PDF, DOCX, TXT) • Sélection multiple autorisée
          </span>
          <span className="text-[11px] font-bold text-red-600 mt-2">
            ⚠️ Assure-toi que tes fichiers sont bien renommés
          </span>
        </label>
      </div>

      {/* 3. Galerie et inventaire des fichiers importés avec renommage en ligne */}
      {photos.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span>Fichiers ajoutés ({photos.length})</span>
            <span className="text-stone-500">Prêts pour l'export</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {photos.map((file) => {
              const isImage = file.category === 'image' || file.type.startsWith('image/');
              const isEditing = editingId === file.id;

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-200 bg-white shadow-xs"
                >
                  {/* Miniature photo ou icône document */}
                  <div className="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200 flex items-center justify-center">
                    {isImage ? (
                      <img
                        src={file.dataUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-amber-700">
                        <FileText className="w-7 h-7" />
                        <span className="text-[9px] uppercase font-bold text-stone-500">Doc</span>
                      </div>
                    )}
                  </div>

                  {/* Métadonnées du fichier ou champ de renommage */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(file.id);
                            if (e.key === 'Escape') cancelRename();
                          }}
                          className="w-full text-xs font-bold border border-amber-500 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => saveRename(file.id)}
                          className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                          title="Valider"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
                          className="p-1 rounded bg-stone-200 text-stone-600 hover:bg-stone-300"
                          title="Annuler"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-stone-900 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => startRename(file)}
                            className="p-0.5 text-stone-400 hover:text-amber-700 transition"
                            title="Renommer ce fichier"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {formatFileSize(file.size)} • {isImage ? 'Photo' : 'Document'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Bouton Supprimer */}
                  <button
                    type="button"
                    onClick={() => handleRemove(file.id)}
                    className="p-2 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                    title="Supprimer ce fichier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
