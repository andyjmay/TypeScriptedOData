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

enum TestEntityProperties {
    Id,
    Name,
    Created,
    Related,
    AnotherRelated,
    RelatedCollection
}

enum RelatedEntityProperties {
    Id,
    Title
}

enum AnotherRelatedEntityProperties {
    Id,
    Status
}

describe('ODataQuery', () => {
    var odataQuery: TypeScriptedOData.ODataQuery;
    
    beforeEach(() => {
        odataQuery = new TypeScriptedOData.ODataQuery();
    })
    
    it("should create empty string from no input", () => {
        var url = odataQuery.compile();
        expect(url).toBe("");
    })
    
    it("should create $select parameter when selecting specific properties of entity", () => {
        odataQuery.select<TestEntityProperties>(<any>TestEntityProperties, [ TestEntityProperties.Id, TestEntityProperties.Name ]);
        var url = odataQuery.compile();
        expect(url).toBe("$select=Id,Name");
    })
    
    it("should add $top parameter when selecting top x", () => {
        odataQuery.take(50);
        var url = odataQuery.compile();
        expect(url).toBe("$top=50");
    })
    
    it("should handle both select and take", () => {
        odataQuery.select<TestEntityProperties>(<any>TestEntityProperties, [ TestEntityProperties.Id, TestEntityProperties.Name ])
                  .take(50);
        var url = odataQuery.compile();
        expect(url).toBe("$select=Id,Name&$top=50");
    });
    
    it("should add $expand parameter when expanding entity", () => {
        odataQuery.expand<TestEntityProperties>(<any>TestEntityProperties, [ TestEntityProperties.Related ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related");
    });
    
    it("should add $expand parameter when expanding entity", () => {
        odataQuery.expand<TestEntityProperties>(<any>TestEntityProperties, [ TestEntityProperties.Related, TestEntityProperties.AnotherRelated ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related,AnotherRelated");
    });
    
    it("should add sub-$select query to expand", () => {
        odataQuery.expand<TestEntityProperties>(<any>TestEntityProperties, [ TestEntityProperties.Related ],
            [ new TypeScriptedOData.ODataQuery().select<RelatedEntityProperties>(<any>RelatedEntityProperties, [RelatedEntityProperties.Title]) ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related($select=Title)");
    });
    
    it("should handle multiple parameters in subquery", () => {
        odataQuery.expand<TestEntityProperties>(<any>TestEntityProperties, [ TestEntityProperties.Related, TestEntityProperties.RelatedCollection ],
            [ new TypeScriptedOData.ODataQuery()
                .select<RelatedEntityProperties>(<any>RelatedEntityProperties, [RelatedEntityProperties.Title]),
              new TypeScriptedOData.ODataQuery()
                .take(5)
            ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related($select=Title),RelatedCollection($top=5)");
    });
    
    it("should add sub-$select queries to multiple expands", () => {
        odataQuery.expand<TestEntityProperties>(<any>TestEntityProperties, [ TestEntityProperties.Related, TestEntityProperties.AnotherRelated ],
            [ 
              new TypeScriptedOData.ODataQuery().select<RelatedEntityProperties>(<any>RelatedEntityProperties, [RelatedEntityProperties.Title]),
              new TypeScriptedOData.ODataQuery().select<AnotherRelatedEntityProperties>(<any>AnotherRelatedEntityProperties, [AnotherRelatedEntityProperties.Status])
            ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related($select=Title),AnotherRelated($select=Status)");
    });
    
    it("should handle one null query with multiple expands", () => {
        odataQuery.expand<TestEntityProperties>(<any>TestEntityProperties, [ TestEntityProperties.Related, TestEntityProperties.AnotherRelated ],
            [ 
              null,
              new TypeScriptedOData.ODataQuery().select<AnotherRelatedEntityProperties>(<any>AnotherRelatedEntityProperties, [AnotherRelatedEntityProperties.Status])
            ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related,AnotherRelated($select=Status)")
    });
});