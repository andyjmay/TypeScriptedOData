/// <reference path="../typings/jasmine/jasmine.d.ts"/>
/// <reference path="../src/ODataQuery.ts"/>
var TestEntity = (function () {
    function TestEntity() {
    }
    return TestEntity;
})();
var RelatedEntity = (function () {
    function RelatedEntity() {
    }
    return RelatedEntity;
})();
var AnotherRelatedEntity = (function () {
    function AnotherRelatedEntity() {
    }
    return AnotherRelatedEntity;
})();
var TestEntityProperties;
(function (TestEntityProperties) {
    TestEntityProperties[TestEntityProperties["Id"] = 0] = "Id";
    TestEntityProperties[TestEntityProperties["Name"] = 1] = "Name";
    TestEntityProperties[TestEntityProperties["Created"] = 2] = "Created";
    TestEntityProperties[TestEntityProperties["Related"] = 3] = "Related";
    TestEntityProperties[TestEntityProperties["AnotherRelated"] = 4] = "AnotherRelated";
    TestEntityProperties[TestEntityProperties["RelatedCollection"] = 5] = "RelatedCollection";
})(TestEntityProperties || (TestEntityProperties = {}));
var RelatedEntityProperties;
(function (RelatedEntityProperties) {
    RelatedEntityProperties[RelatedEntityProperties["Id"] = 0] = "Id";
    RelatedEntityProperties[RelatedEntityProperties["Title"] = 1] = "Title";
})(RelatedEntityProperties || (RelatedEntityProperties = {}));
var AnotherRelatedEntityProperties;
(function (AnotherRelatedEntityProperties) {
    AnotherRelatedEntityProperties[AnotherRelatedEntityProperties["Id"] = 0] = "Id";
    AnotherRelatedEntityProperties[AnotherRelatedEntityProperties["Status"] = 1] = "Status";
})(AnotherRelatedEntityProperties || (AnotherRelatedEntityProperties = {}));
describe('ODataQuery', function () {
    var odataQuery;
    beforeEach(function () {
        odataQuery = new TypeScriptedOData.ODataQuery();
    });
    it("should create empty string from no input", function () {
        var url = odataQuery.compile();
        expect(url).toBe("");
    });
    it("should create $select parameter when selecting specific properties of entity", function () {
        odataQuery.select(TestEntityProperties, [TestEntityProperties.Id, TestEntityProperties.Name]);
        var url = odataQuery.compile();
        expect(url).toBe("$select=Id,Name");
    });
    it("should add $top parameter when selecting top x", function () {
        odataQuery.take(50);
        var url = odataQuery.compile();
        expect(url).toBe("$top=50");
    });
    it("should handle both select and take", function () {
        odataQuery.select(TestEntityProperties, [TestEntityProperties.Id, TestEntityProperties.Name])
            .take(50);
        var url = odataQuery.compile();
        expect(url).toBe("$select=Id,Name&$top=50");
    });
    it("should add $expand parameter when expanding entity", function () {
        odataQuery.expand(TestEntityProperties, [TestEntityProperties.Related]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related");
    });
    it("should add $expand parameter when expanding entity", function () {
        odataQuery.expand(TestEntityProperties, [TestEntityProperties.Related, TestEntityProperties.AnotherRelated]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related,AnotherRelated");
    });
    it("should add sub-$select query to expand", function () {
        odataQuery.expand(TestEntityProperties, [TestEntityProperties.Related], [new TypeScriptedOData.ODataQuery().select(RelatedEntityProperties, [RelatedEntityProperties.Title])]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related($select=Title)");
    });
    it("should handle multiple parameters in subquery", function () {
        odataQuery.expand(TestEntityProperties, [TestEntityProperties.Related, TestEntityProperties.RelatedCollection], [new TypeScriptedOData.ODataQuery()
                .select(RelatedEntityProperties, [RelatedEntityProperties.Title]),
            new TypeScriptedOData.ODataQuery()
                .take(5)
        ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related($select=Title),RelatedCollection($top=5)");
    });
    it("should add sub-$select queries to multiple expands", function () {
        odataQuery.expand(TestEntityProperties, [TestEntityProperties.Related, TestEntityProperties.AnotherRelated], [
            new TypeScriptedOData.ODataQuery().select(RelatedEntityProperties, [RelatedEntityProperties.Title]),
            new TypeScriptedOData.ODataQuery().select(AnotherRelatedEntityProperties, [AnotherRelatedEntityProperties.Status])
        ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related($select=Title),AnotherRelated($select=Status)");
    });
    it("should handle one null query with multiple expands", function () {
        odataQuery.expand(TestEntityProperties, [TestEntityProperties.Related, TestEntityProperties.AnotherRelated], [
            null,
            new TypeScriptedOData.ODataQuery().select(AnotherRelatedEntityProperties, [AnotherRelatedEntityProperties.Status])
        ]);
        var url = odataQuery.compile();
        expect(url).toBe("$expand=Related,AnotherRelated($select=Status)");
    });
});
