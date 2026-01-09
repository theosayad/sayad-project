
export const FAMILY_DATA = {
  "individuals": [
    { "id": "P01", "name": "Karim Sayad", "generation": "1" },
    { "id": "P02", "name": "Gemela Sayad", "generation": "1", "note": "DOB listed as 'Who'" },
    { "id": "P03", "name": "Edouard Sayad", "generation": "2" },
    { "id": "P04", "name": "Marie Akl", "role": "Spouse of Edouard" },
    { "id": "P05", "name": "George Sayad", "generation": "2", "status": "Predeceased Elias" },
    { "id": "P06", "name": "Elias Sayad", "generation": "2", "legacy": "Founder of Asiatic Hosiery Co." },
    { "id": "P07", "name": "Mary Orfaly", "role": "Spouse of Elias" },
    { "id": "P08", "name": "Joseph Sayad", "generation": "2", "status": "Predeceased Elias" },
    { "id": "P09", "name": "Olga Sayad", "generation": "2" },
    { "id": "P10", "name": "Mary Sayad", "generation": "2" },
    { "id": "P11", "name": "Antoinette Sayad", "generation": "2", "legacy": "Philanthropic leader" },
    { "id": "P12", "name": "Richard Esper (Sr)", "role": "Spouse of Antoinette" },
    
    /* Branch: Edouard > Paul */
    { "id": "P27", "name": "Paul Sayad", "generation": "3", "location": "Dubai" },
    { "id": "P33", "name": "Maia Aoun", "role": "Wife of Paul" },
    { "id": "P34", "name": "Theo Sayad", "generation": "4", "location": "Berlin" },
    { "id": "P35", "name": "Gio Sayad", "generation": "4", "location": "Beirut" },
    { "id": "P36", "name": "Chloe Sayad", "generation": "4", "location": "Beirut" },

    /* Branch: Edouard > Alain */
    { "id": "P31", "name": "Alain Sayad", "generation": "3", "location": "Beirut" },
    { "id": "P37", "name": "Roula Farah", "role": "Wife of Alain" },
    { "id": "P38", "name": "Alessandro Sayad", "generation": "4", "location": "Paris" },
    { "id": "P39", "name": "Chiara Sayad", "generation": "4", "location": "Beirut" },

    /* Branch: Edouard > Rony */
    { "id": "P29", "name": "Rony Sayad", "generation": "3", "location": "Beirut" },
    { "id": "P40", "name": "Carla", "role": "Wife of Rony" },
    { "id": "P41", "name": "Anya Sayad", "generation": "4" },
    { "id": "P42", "name": "Yendi Sayad", "generation": "4" },
    { "id": "P43", "name": "Yara Sayad", "generation": "4" },

    /* Branch: Edouard > Eddy */
    { "id": "id_eddy", "name": "Eddy Sayad", "generation": "3", "location": "Beirut" },
    { "id": "P44", "name": "Edouard Sayad (Jr)", "generation": "4" },
    { "id": "P45", "name": "Karen Sayad", "generation": "4" },
    { "id": "P46", "name": "Tracy Sayad", "generation": "4" },

    /* Branch: Edouard > Ralph */
    { "id": "P30", "name": "Ralph Sayad", "generation": "3", "location": "Beirut" },
    { "id": "P47", "name": "Joanne", "role": "Wife of Ralph" },
    { "id": "P48", "name": "Ralph Sayad (Jr)", "generation": "4" },
    { "id": "P49", "name": "Kiko Sayad", "generation": "4" },
    { "id": "P50", "name": "Jamie Sayad", "generation": "4" },

    /* Branch: Edouard > Dany */
    { "id": "P32", "name": "Dany Sayad", "generation": "3", "location": "Tampa, Florida" },
    { "id": "P51", "name": "Luke Sayad", "generation": "4" },
    { "id": "P52", "name": "Becca Sayad", "generation": "4" },
    { "id": "P53", "name": "Karly Sayad", "generation": "4" },

    /* Elias & Antoinette Branches */
    { "id": "P13", "name": "Gemma Sayad", "generation": "3", "location": "NY" },
    { "id": "P14", "name": "Louis Sayad", "generation": "3", "location": "Wayne, NJ", "note": "Active in St. Ann’s Church" },
    { "id": "P16", "name": "Mary Lou Sayad", "generation": "3", "location": "Mountain Lakes, NJ" },
    { "id": "P17", "name": "Judy Sayad", "generation": "3", "location": "Totowa, NJ" },
    { "id": "P19", "name": "Richard Esper (Jr)", "generation": "3", "location": "Wayne, NJ", "profession": "Medical Professional" },
    { "id": "P20", "name": "James Esper", "generation": "3", "location": "Mountain Lakes, NJ", "profession": "Medical Professional" },
    { "id": "P21", "name": "Vincent De Caprio", "role": "Spouse of Mary Lou" },
    { "id": "P22", "name": "Louis Karim Sayad DeCaprio", "generation": "4", "location": "Los Angeles", "profession": "Filmmaker" }
  ],
  "relationships": [
    { "parent": ["P01", "P02"], "child": "P03", "type": "biological" },
    { "marriage": ["P03", "P04"] },
    /* Edouard's Children and Grandchildren */
    { "parent": ["P03", "P04"], "child": "P27" },
    { "marriage": ["P27", "P33"] },
    { "parent": ["P27", "P33"], "children": ["P34", "P35", "P36"] },
    
    { "parent": ["P03", "P04"], "child": "P31" },
    { "marriage": ["P31", "P37"] },
    { "parent": ["P31", "P37"], "children": ["P38", "P39"] },

    { "parent": ["P03", "P04"], "child": "P29" },
    { "marriage": ["P29", "P40"] },
    { "parent": ["P29", "P40"], "children": ["P41", "P42", "P43"] },

    { "parent": ["P03", "P04"], "child": "id_eddy" },
    { "parent": ["id_eddy"], "children": ["P44", "P45", "P46"] },

    { "parent": ["P03", "P04"], "child": "P30" },
    { "marriage": ["P30", "P47"] },
    { "parent": ["P30", "P47"], "children": ["P48", "P49", "P50"] },

    { "parent": ["P03", "P04"], "child": "P32" },
    { "parent": ["P32"], "children": ["P51", "P52", "P53"] },

    /* Other Root Branches */
    { "parent": ["P01", "P02"], "child": "P06" },
    { "marriage": ["P06", "P07"] },
    { "parent": ["P06"], "children": ["P14", "P16", "P17"] },
    { "marriage": ["P16", "P21"] },
    { "parent": ["P16", "P21"], "child": "P22" }
  ]
}
