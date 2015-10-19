/// <reference path="../typings/jasmine/jasmine.d.ts"/>
/// <reference path="../src/ODataQuery.ts"/>
describe('ODataQuery', function () {
    var odataQuery;
    beforeEach(function () {
        odataQuery = new TypeScriptedOData.ODataQuery();
    });
    it("should create empty string from no input", function () {
        var url = odataQuery.compile();
        expect(url).toBe("");
    });
    describe("select", function () {
        it("should create $select parameter when selecting one property", function () {
            odataQuery.select(["Name"]);
            var url = odataQuery.compile();
            expect(url).toBe("$select=Name");
        });
        it("should create $select parameter when selecting specific properties of entity", function () {
            odataQuery.select(["Id", "Name"]);
            var url = odataQuery.compile();
            expect(url).toBe("$select=Id,Name");
        });
    });
    describe("take", function () {
        it("should add $top parameter when selecting top x", function () {
            odataQuery.take(50);
            var url = odataQuery.compile();
            expect(url).toBe("$top=50");
        });
        it("should handle both select and take", function () {
            odataQuery.select(["Id", "Name"])
                .take(50);
            var url = odataQuery.compile();
            expect(url).toBe("$select=Id,Name&$top=50");
        });
    });
    describe("expand", function () {
        it("should add $expand parameter when expanding entity", function () {
            odataQuery.expand(["Related"]);
            var url = odataQuery.compile();
            expect(url).toBe("$expand=Related");
        });
        it("should add $expand parameter when expanding entity", function () {
            odataQuery.expand(["Related", "AnotherRelated"]);
            var url = odataQuery.compile();
            expect(url).toBe("$expand=Related,AnotherRelated");
        });
        it("should add sub-$select query to expand", function () {
            odataQuery.expand(["Related"], [new TypeScriptedOData.ODataQuery().select(["Title"])]);
            var url = odataQuery.compile();
            expect(url).toBe("$expand=Related($select=Title)");
        });
        it("should handle multiple parameters in subquery", function () {
            odataQuery.expand(["Related", "RelatedCollection"], [new TypeScriptedOData.ODataQuery()
                    .select(["Title"]),
                new TypeScriptedOData.ODataQuery()
                    .take(5)
            ]);
            var url = odataQuery.compile();
            expect(url).toBe("$expand=Related($select=Title),RelatedCollection($top=5)");
        });
        it("should add sub-$select queries to multiple expands", function () {
            odataQuery.expand(["Related", "AnotherRelated"], [
                new TypeScriptedOData.ODataQuery().select(["Title"]),
                new TypeScriptedOData.ODataQuery().select(["Status"])
            ]);
            var url = odataQuery.compile();
            expect(url).toBe("$expand=Related($select=Title),AnotherRelated($select=Status)");
        });
        it("should handle one null query with multiple expands", function () {
            odataQuery.expand(["Related", "AnotherRelated"], [
                null,
                new TypeScriptedOData.ODataQuery().select(["Status"])
            ]);
            var url = odataQuery.compile();
            expect(url).toBe("$expand=Related,AnotherRelated($select=Status)");
        });
    });
    describe("$count", function () {
        it("should default $count to true when calling count()", function () {
            odataQuery.count();
            var url = odataQuery.compile();
            expect(url).toBe("$count=true");
        });
        it("should accept count(true)", function () {
            odataQuery.count(true);
            var url = odataQuery.compile();
            expect(url).toBe("$count=true");
        });
        it("should set $count=false when calling count(false)", function () {
            odataQuery.count(false);
            var url = odataQuery.compile();
            expect(url).toBe("$count=false");
        });
    });
    describe("filter", function () {
        it("should add single quote around string parameter when filtering", function () {
            odataQuery.filter(new TypeScriptedOData.FilterQuery({
                property: "Name",
                operator: TypeScriptedOData.ComparisonOperator.Equals,
                propertyValue: "Steve"
            }));
            var url = odataQuery.compile();
            expect(url).toBe("$filter=Name eq 'Steve'");
        });
        it("should not add any quotes around number parameter when filtering", function () {
            odataQuery.filter(new TypeScriptedOData.FilterQuery({
                property: "Cost",
                operator: TypeScriptedOData.ComparisonOperator.LessThan,
                propertyValue: 150.5
            }));
            var url = odataQuery.compile();
            expect(url).toBe("$filter=Cost lt 150.5");
        });
        it('should handle multiple filters with "and"', function () {
            odataQuery.filter(new TypeScriptedOData.FilterQuery({
                property: "Name",
                operator: TypeScriptedOData.ComparisonOperator.Equals,
                propertyValue: "Steve"
            })
                .and(new TypeScriptedOData.FilterQuery({
                property: "Price",
                operator: TypeScriptedOData.ComparisonOperator.GreaterThan,
                propertyValue: 2.55
            })));
            var url = odataQuery.compile();
            expect(url).toBe("$filter=Name eq 'Steve' and Price gt 2.55");
        });
        it('should handle multiple filters with "or"', function () {
            odataQuery.filter(new TypeScriptedOData.FilterQuery({
                property: "Name",
                operator: TypeScriptedOData.ComparisonOperator.Equals,
                propertyValue: "Steve"
            })
                .or(new TypeScriptedOData.FilterQuery({
                property: "Price",
                operator: TypeScriptedOData.ComparisonOperator.GreaterThan,
                propertyValue: 2.55
            })));
            var url = odataQuery.compile();
            expect(url).toBe("$filter=Name eq 'Steve' or Price gt 2.55");
        });
    });
});
