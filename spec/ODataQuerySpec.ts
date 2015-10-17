/// <reference path="../typings/jasmine/jasmine.d.ts"/>
/// <reference path="../src/ODataQuery.ts"/>

class TestEntity {
    Id: number;
    Name: string;
    Created: Date;
    Related: RelatedEntity;
    AnotherRelated: AnotherRelatedEntity;
    RelatedCollection: RelatedEntity[];
}

class RelatedEntity {
    Id: number;
    Title: string;
}

class AnotherRelatedEntity {
    Id: number;
    Status: string;
}

describe('ODataQuery', () => {
    var odataQuery: TypeScriptedOData.ODataQuery;
    
    beforeEach(() => {
        odataQuery = new TypeScriptedOData.ODataQuery();
    });
    
    it("should create empty string from no input", () => {
        var url = odataQuery.compile();
        expect(url).toBe("");
    });
    
    it("should create $select parameter when selecting specific properties of entity", () => {
        odataQuery.select([ "Id", "Name" ]);
        var url = odataQuery.compile();
        expect(url).toBe("$select=Id,Name");
    });
    
    it("should add $top parameter when selecting top x", () => {
        odataQuery.take(50);
        var url = odataQuery.compile();
        expect(url).toBe("$top=50");
    });
    
    it("should handle both select and take", () => {
        odataQuery.select([ "Id", "Name" ])
                  .take(50);
        var url = odataQuery.compile();
        expect(url).toBe("$select=Id,Name&$top=50");
    });
    
    it("should add $expand parameter when expanding entity", () => {
        odataQuery.expand([ "Related" ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related");
    });
    
    it("should add $expand parameter when expanding entity", () => {
        odataQuery.expand([ "Related", "AnotherRelated" ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related,AnotherRelated");
    });
    
    it("should add sub-$select query to expand", () => {
        odataQuery.expand([ "Related" ],
            [ new TypeScriptedOData.ODataQuery().select([ "Title" ]) ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related($select=Title)");
    });
    
    it("should handle multiple parameters in subquery", () => {
        odataQuery.expand([ "Related", "RelatedCollection" ],
            [ new TypeScriptedOData.ODataQuery()
                .select([ "Title" ]),
              new TypeScriptedOData.ODataQuery()
                .take(5)
            ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related($select=Title),RelatedCollection($top=5)");
    });
    
    it("should add sub-$select queries to multiple expands", () => {
        odataQuery.expand([ "Related", "AnotherRelated" ],
            [ 
              new TypeScriptedOData.ODataQuery().select([ "Title" ]),
              new TypeScriptedOData.ODataQuery().select([ "Status" ])
            ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related($select=Title),AnotherRelated($select=Status)");
    });
    
    it("should handle one null query with multiple expands", () => {
        odataQuery.expand([ "Related", "AnotherRelated" ],
            [ 
              null,
              new TypeScriptedOData.ODataQuery().select([ "Status" ])
            ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related,AnotherRelated($select=Status)")
    });
});