
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SiblingCard } from './components/SiblingCard';
import { Sibling } from './types';
import { FAMILY_DATA } from './data';

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/CuRJvqRMHRn3lWyvKP5QPs";

const SIBLINGS_BASE: Omit<Sibling, 'childrenCount'>[] = [
  { id: "P03", name: "Edouard Sayad", migrationDestination: "Beirut", description: "The patriarch of the Beirut branch, anchoring the family in the Lebanese capital while extending its reach globally." },
  { id: "P06", name: "Elias Sayad", migrationDestination: "New Jersey", description: "Pioneer of the American migration, founder of Asiatic Hosiery Co., and a stalwart of the Melkite community in the US." },
  { id: "P11", name: "Antoinette Sayad", migrationDestination: "New Jersey", description: "Remembered for her leadership and dedication to the family's values of faith and service." },
  { id: "P05", name: "George Sayad", description: "A branch of the family whose full story is waiting to be told and reunited with the global heart of the Sayads." },
  { id: "P08", name: "Joseph Sayad", description: "A legacy that spans generations; we are currently looking for the right voices to help us honor this branch." },
  { id: "P09", name: "Olga Sayad", description: "Her descendants represent a vital part of our shared heritage that we haven't yet mapped out." },
  { id: "P10", name: "Mary Sayad", description: "An integral part of the original seven, whose children and grandchildren we seek to celebrate here." },
];

const App: React.FC = () => {
  const [selectedSiblingId, setSelectedSiblingId] = useState<string | null>(null);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const explorerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Effect to handle scrolling when a branch is selected
  useEffect(() => {
    if (selectedSiblingId && explorerRef.current) {
      explorerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedSiblingId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDescendantsRecursive = (parentId: string): string[] => {
    let descendantIds: string[] = [];
    FAMILY_DATA.relationships.forEach(rel => {
      // @ts-ignore
      if (rel.parent && (Array.isArray(rel.parent) ? rel.parent.includes(parentId) : rel.parent === parentId)) {
        // @ts-ignore
        if (rel.child) {
          // @ts-ignore
          descendantIds.push(rel.child);
          // @ts-ignore
          descendantIds = [...descendantIds, ...getDescendantsRecursive(rel.child)];
        }
        // @ts-ignore
        if (rel.children) {
          // @ts-ignore
          descendantIds = [...descendantIds, ...rel.children];
          // @ts-ignore
          rel.children.forEach(childId => {
            descendantIds = [...descendantIds, ...getDescendantsRecursive(childId)];
          });
        }
      }
    });
    return Array.from(new Set(descendantIds));
  };

  const formatGeneration = (generation: string | undefined) => {
    const n = Number(generation);
    if (!Number.isFinite(n) || n <= 0) return 'Generation';
    const mod100 = n % 100;
    const suffix =
      mod100 >= 11 && mod100 <= 13
        ? 'th'
        : n % 10 === 1
          ? 'st'
          : n % 10 === 2
            ? 'nd'
            : n % 10 === 3
              ? 'rd'
              : 'th';
    return `${n}${suffix} generation`;
  };

  const siblingsWithCounts: Sibling[] = useMemo(() => {
    return SIBLINGS_BASE.map(s => ({
      ...s,
      childrenCount: getDescendantsRecursive(s.id).length
    }));
  }, []);

  const globalSearchResults = useMemo(() => {
    if (searchTerm.length < 2) return [];
    
    return FAMILY_DATA.individuals
      .filter(person => 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !SIBLINGS_BASE.some(s => s.id === person.id)
      )
      .map(person => {
        let rootBranchId: string | null = null;
        for (const sibling of SIBLINGS_BASE) {
          if (getDescendantsRecursive(sibling.id).includes(person.id)) {
            rootBranchId = sibling.id;
            break;
          }
        }
        
        const rel = (FAMILY_DATA.relationships as any[]).find((r: any) => 
          r.child === person.id || (r.children && r.children.includes(person.id))
        );
        const parentId = Array.isArray(rel?.parent) ? rel?.parent[0] : rel?.parent;
        const parentName = FAMILY_DATA.individuals.find(i => i.id === parentId)?.name;

        return { ...person, rootBranchId, parentName, parentId };
      })
      .filter(res => res.rootBranchId)
      .slice(0, 5);
  }, [searchTerm]);

  const branchMembers = useMemo(() => {
    if (!selectedSiblingId) return [];
    const descendantIds = getDescendantsRecursive(selectedSiblingId);
    return descendantIds
      .map(id => FAMILY_DATA.individuals.find(ind => ind.id === id))
      .filter(Boolean)
      .sort((a, b) => {
        // @ts-ignore
        const genA = parseInt(a?.generation || '3');
        // @ts-ignore
        const genB = parseInt(b?.generation || '3');
        if (genA !== genB) return genA - genB;
        return (a?.name || '').localeCompare(b?.name || '');
      });
  }, [selectedSiblingId]);

  const { directChildren, subgroups } = useMemo(() => {
    const direct: any[] = [];
    const groups: Record<string, any[]> = {};
    
    if (!selectedSiblingId) return { directChildren: direct, subgroups: groups };

    branchMembers.forEach(member => {
      const rel = FAMILY_DATA.relationships.find((r: any) => 
        r.child === member?.id || (r.children && r.children.includes(member?.id || ''))
      );
      
      const parentIds = rel?.parent ? (Array.isArray(rel.parent) ? rel.parent : [rel.parent]) : [];
      const isDirectChild = parentIds.includes(selectedSiblingId);
      
      if (isDirectChild) {
        direct.push(member);
      } else {
        const primaryParent = parentIds[0];
        if (primaryParent) {
          if (!groups[primaryParent]) groups[primaryParent] = [];
          groups[primaryParent].push(member);
        }
      }
    });
    return { directChildren: direct, subgroups: groups };
  }, [branchMembers, selectedSiblingId]);

  const handleSelectResult = (result: any) => {
    setSelectedSiblingId(result.rootBranchId);
    const targetUnitId = result.generation === "4" ? result.parentId : result.id;
    if (targetUnitId) {
      setExpandedUnitId(targetUnitId);
    }
    setSearchTerm('');
    setShowSearchResults(false);
    
    setTimeout(() => {
      const element = document.getElementById(`unit-${targetUnitId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-offset-2', 'ring-4', 'ring-aleppo');
        setTimeout(() => {
          element.classList.remove('ring-offset-2', 'ring-4', 'ring-aleppo');
        }, 2000);
      } else {
        explorerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const filteredSiblings = siblingsWithCounts.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnitToggle = (unitId: string) => {
    setExpandedUnitId(expandedUnitId === unitId ? null : unitId);
  };

  const currentSiblingName = useMemo(() => 
    siblingsWithCounts.find(s => s.id === selectedSiblingId)?.name, 
  [selectedSiblingId, siblingsWithCounts]);

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-stone-900 selection:bg-aleppo/20 overflow-x-hidden">
      <header className="relative py-28 md:py-48 px-4 bg-[#1a1512] text-stone-100 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] card-pattern scale-150"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#1a1512]/90"></div>
        
        <div className="absolute top-8 left-8 md:top-10 md:left-10 z-20 text-[9px] text-stone-500 uppercase tracking-[0.6em] animate-fade-in flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-1 h-1 bg-aleppo rounded-full animate-pulse"></span>
            By <span className="text-stone-300 font-bold">Theo Sayad</span>
          </span>
          <a href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#25D366]/10 text-[#25D366] rounded-full hover:bg-[#25D366]/20 transition-all border border-[#25D366]/20">
            <span className="text-[7px] font-bold tracking-widest uppercase">Live Registry</span>
          </a>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          <span className="inline-block text-aleppo text-[10px] md:text-[11px] font-bold uppercase tracking-[0.8em] mb-6 animate-fade-in opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
            Digital Heritage Platform
          </span>
          
          <h1 className="text-6xl md:text-[10rem] font-normal italic mb-8 tracking-tighter text-white leading-[0.75] animate-fade-in opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards] drop-shadow-2xl">
            The Sayad Project
          </h1>
          
          <div className="max-w-xl mx-auto mb-16 animate-fade-in opacity-0 [animation-delay:600ms] [animation-fill-mode:forwards]">
            <p className="text-stone-400 italic font-serif text-xl md:text-2xl leading-relaxed mb-8 opacity-90 text-balance">
              "How good and how pleasant it is for brethren to dwell together in unity!"
            </p>
            <div className="flex items-center justify-center gap-4 text-stone-400">
              <div className="h-[0.5px] w-12 bg-stone-700"></div>
              <span className="text-[9px] uppercase tracking-[0.5em] font-bold opacity-70">Psalm 133:1</span>
              <div className="h-[0.5px] w-12 bg-stone-700"></div>
            </div>
          </div>
          
          <a 
            href={WHATSAPP_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-12 py-5 bg-white text-stone-900 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-aleppo hover:text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95 animate-fade-in opacity-0 [animation-delay:800ms] [animation-fill-mode:forwards]"
          >
            <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Sayads Worldwide
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 md:-mt-14 pb-20 md:pb-32">
        <section ref={searchRef} className="max-w-3xl mx-auto mb-12 md:mb-24 z-30 relative group">
          <div className="bg-white p-1.5 md:p-2 rounded-full shadow-2xl border border-stone-100 ring-4 md:ring-8 ring-[#fdfaf6] relative transition-transform duration-300 hover:scale-[1.01]">
            <div className="relative flex items-center">
              <svg className="absolute left-5 md:left-6 w-4 md:w-5 h-4 md:h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Find a family member or branch..."
                className="w-full pl-12 md:pl-14 pr-6 py-3 md:py-4 rounded-full bg-transparent border-none outline-none text-base md:text-lg font-light placeholder:text-stone-300"
                value={searchTerm}
                onFocus={() => setShowSearchResults(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchResults(true);
                }}
              />
            </div>
          </div>

          {showSearchResults && searchTerm.length >= 2 && (
            <div className="absolute top-full left-4 right-4 mt-4 bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden animate-fade-in z-50">
              {globalSearchResults.length > 0 ? (
                <>
                  <div className="p-4 border-b border-stone-50 bg-stone-50/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Search Records</span>
                    <span className="text-[10px] text-aleppo font-bold uppercase">{globalSearchResults.length} Results</span>
                  </div>
                  <div className="divide-y divide-stone-50">
                    {globalSearchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectResult(result)}
                        className="w-full p-6 text-left hover:bg-aleppo/5 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg font-bold text-stone-800 group-hover:text-aleppo transition-colors">
                              {result.name}
                            </span>
                            <span className="text-[9px] font-mono font-bold bg-stone-100 px-1.5 py-0.5 rounded text-stone-400">
                              {formatGeneration(result.generation)}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 font-light italic">
                            Child of {result.parentName} &bull; {siblingsWithCounts.find(s => s.id === result.rootBranchId)?.name} Branch
                          </p>
                        </div>
                        {result.location && (
                          <span className="px-3 py-1 bg-white border border-stone-100 rounded-full text-[9px] font-bold uppercase tracking-widest text-aleppo shadow-sm">
                            {result.location}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-10 md:p-14 text-center">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl md:text-2xl font-serif italic text-stone-800 mb-3">Family member not found in current records</h4>
                  <p className="text-stone-500 font-light text-sm md:text-base leading-relaxed mb-8 max-w-sm mx-auto">
                    We are still building our global tree. If you know a Sayad descendant that should be here, please let me know!
                  </p>
                  <a 
                    href={WHATSAPP_GROUP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-stone-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-aleppo transition-all shadow-lg active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Message me on WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="mb-8 md:mb-12 flex items-baseline justify-between border-b border-stone-200 pb-4">
          <h2 className="text-2xl md:text-3xl italic text-stone-800 font-serif">Main Branches</h2>
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">{filteredSiblings.length} Roots</span>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mb-16 md:mb-24">
          {filteredSiblings.map((sibling) => (
            <SiblingCard 
              key={sibling.id} 
              sibling={sibling} 
              isSelected={selectedSiblingId === sibling.id}
              onSelect={(id) => {
                setSelectedSiblingId(id === selectedSiblingId ? null : id);
                setExpandedUnitId(null);
              }}
            />
          ))}
        </section>

        {selectedSiblingId && (
          <section ref={explorerRef} className="mb-16 md:mb-24 animate-fade-in scroll-mt-6 md:scroll-mt-12">
            <div className="bg-stone-50 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-stone-200 shadow-sm relative overflow-hidden">
              <div className="mb-10 text-center md:text-left">
                <span className="text-aleppo text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Lineage Explorer</span>
                <h3 className="text-3xl md:text-6xl italic text-stone-900 leading-tight">
                  Lineage of {currentSiblingName}
                </h3>
              </div>
              
              {directChildren.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {directChildren.map((child) => {
                    const descendants = subgroups[child.id] || [];
                    const isExpanded = expandedUnitId === child.id;
                    
                    return (
                      <div 
                        key={child.id} 
                        id={`unit-${child.id}`}
                        className={`bg-white rounded-3xl transition-all duration-300 border flex flex-col ${isExpanded ? 'shadow-md border-aleppo/20 ring-2 ring-aleppo/5' : 'shadow-sm border-stone-100'}`}
                      >
                        <div className="p-6 md:p-8 flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-1.5 h-8 rounded-full ${isExpanded ? 'bg-aleppo' : 'bg-stone-100'}`}></div>
                            <div>
                              <h4 className="text-lg md:text-xl font-bold text-stone-800">
                                {child.name}
                              </h4>
                              {child.location && (
                                <p className="text-[10px] text-aleppo font-bold uppercase tracking-widest mt-0.5">
                                  {child.location}
                                </p>
                              )}
                            </div>
                          </div>

                          {descendants.length > 0 ? (
                            <button 
                              onClick={() => handleUnitToggle(child.id)}
                              className={`w-full mt-4 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-between border transition-all ${
                                isExpanded 
                                  ? 'bg-aleppo text-white border-aleppo' 
                                  : 'bg-stone-50 text-stone-400 border-stone-100 hover:bg-stone-100'
                              }`}
                            >
                              <span>{isExpanded ? 'Hide descendants' : `View ${descendants.length} descendants`}</span>
                              <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          ) : null}
                        </div>

                        {isExpanded && descendants.length > 0 && (
                          <div className="px-6 pb-8 md:px-8 md:pb-10 animate-fade-in bg-stone-50/50 rounded-b-3xl border-t border-stone-100">
                            <div className="pt-6 space-y-4">
                              {descendants.map(member => (
                                <div key={member.id} className="flex justify-between items-center group">
                                  <div>
                                    <p className="text-sm font-bold text-stone-700 group-hover:text-stone-900 transition-colors">{member.name}</p>
                                    {member.location && (
                                      <p className="text-[9px] text-stone-400 font-bold uppercase">{member.location}</p>
                                    )}
                                  </div>
                                  <span className="text-[8px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-stone-100 text-stone-300">
                                    {formatGeneration(member.generation)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] p-10 md:p-16 border border-stone-100 shadow-sm text-center max-w-2xl mx-auto">
                   <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8">
                     <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
                   </div>
                   <h4 className="text-2xl italic text-stone-800 mb-4">Tree Expansion Needed</h4>
                   <p className="text-stone-500 font-light leading-relaxed mb-10 text-balance">
                     We are still mapping the legacy of {currentSiblingName}. If you are a descendant of this branch, please connect with me to help complete the tree.
                   </p>
                   <a 
                    href={WHATSAPP_GROUP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#4a5d4e] text-stone-100 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#3d4d40] transition-all shadow-lg active:scale-95"
                   >
                     Join Community
                   </a>
                </div>
              )}

              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setSelectedSiblingId(null)}
                  className="px-8 py-3 bg-stone-900 text-stone-100 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-aleppo transition-colors shadow-lg"
                >
                  Close Explorer
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="bg-[#1a1512] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-5 min-h-[400px]">
          <div className="lg:col-span-2 p-10 md:p-16 flex flex-col justify-center relative border-b lg:border-b-0 lg:border-r border-stone-800">
            <div className="absolute inset-0 opacity-10 card-pattern"></div>
            <div className="relative z-10">
              <span className="text-aleppo text-[9px] md:text-[11px] tracking-[0.5em] uppercase mb-4 block font-bold">A Global Legacy</span>
              <h2 className="text-4xl md:text-5xl italic text-white mb-6">Pride & <br className="hidden md:block"/>Continuity</h2>
              <div className="w-10 h-0.5 bg-aleppo mb-6"></div>
              <p className="text-stone-400 font-serif italic text-lg leading-relaxed">
                "We are spread across the world, yet tied by a single name and a shared history that connects every cousin today."
              </p>
            </div>
          </div>
          <div className="lg:col-span-3 p-10 md:p-16 bg-white flex items-center relative">
            <div className="animate-fade-in w-full">
              <p className="text-xl md:text-3xl font-serif italic leading-relaxed text-stone-800 border-l-4 border-aleppo/20 pl-6 md:pl-10 text-balance">
                The Sayad name has traveled far. From the original seven siblings, our family has grown into a global network living in New York, New Jersey, Beirut, Dubai, Tampa, and beyond. This project is about more than just history—it's about the present.
              </p>
              <div className="mt-8 flex gap-4">
                <a 
                  href={WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#1a1512] text-stone-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-aleppo transition-all"
                >
                  Join Global Group
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-16 md:py-24 text-center border-t border-stone-200/70 bg-[#fdfaf6]">
        <div className="max-w-2xl mx-auto px-6">
          <div className="mb-10 md:mb-12">
            <h4 className="text-2xl md:text-3xl italic text-stone-800 mb-4">The Sayad Project</h4>
            <div className="w-8 h-px bg-stone-200 mx-auto mb-6"></div>
            <p className="text-xs md:text-sm text-stone-400 font-light leading-relaxed uppercase tracking-[0.2em] mb-10">
              Dedicated to the <br/>
              <span className="text-aleppo font-bold">Generations of Cousins</span><br/>
              building our shared future worldwide.
            </p>
          </div>

          <div className="grid gap-10 md:gap-12">
            <a
              href={WHATSAPP_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1a1512] text-stone-100 p-8 md:p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-white/10 relative overflow-hidden block group transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="absolute inset-0 opacity-10 card-pattern"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/25"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="w-1.5 h-1.5 bg-aleppo rounded-full"></span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-aleppo">Join WhatsApp Community</span>
                </div>
                <p className="text-lg md:text-xl font-serif italic leading-relaxed text-stone-300 group-hover:text-white transition-colors text-balance">
                  "This project is a promise that wherever you go, you have family waiting—a global home that is always open to you."
                </p>
                <div className="mt-8 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-stone-900 text-[10px] font-bold uppercase tracking-[0.25em] group-hover:bg-aleppo group-hover:text-white transition-colors shadow-lg">
                    Enter Community
                    <span aria-hidden="true" className="text-xs leading-none">→</span>
                  </span>
                </div>
              </div>
            </a>

            <div className="flex flex-wrap justify-center gap-2.5 md:gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-white/70 border border-stone-200/70 text-[9px] text-stone-700 uppercase tracking-[0.25em] font-bold">New York</span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/70 border border-stone-200/70 text-[9px] text-stone-700 uppercase tracking-[0.25em] font-bold">New Jersey</span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/70 border border-stone-200/70 text-[9px] text-stone-700 uppercase tracking-[0.25em] font-bold">Beirut</span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/70 border border-stone-200/70 text-[9px] text-stone-700 uppercase tracking-[0.25em] font-bold">Dubai</span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/70 border border-stone-200/70 text-[9px] text-stone-700 uppercase tracking-[0.25em] font-bold">Tampa</span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/70 border border-stone-200/70 text-[9px] text-stone-700 uppercase tracking-[0.25em] font-bold">Berlin</span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/70 border border-stone-200/70 text-[9px] text-stone-700 uppercase tracking-[0.25em] font-bold">Paris</span>
              <span className="px-3.5 py-1.5 rounded-full bg-aleppo/10 border border-aleppo/20 text-[9px] text-aleppo uppercase tracking-[0.25em] font-bold">AND MORE!</span>
            </div>

            <div className="text-[8px] text-stone-600/70 uppercase tracking-widest flex flex-col items-center gap-3">
              <div className="h-px w-20 bg-stone-200/80"></div>
              <span>Archive &bull; 2026</span>
              <span className="text-stone-700/70 font-light tracking-[0.5em]">Developed by <span className="font-bold text-stone-800">Theo Sayad</span></span>
              <a href="#" className="text-stone-600/70 hover:text-aleppo transition-colors">Back to top</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
