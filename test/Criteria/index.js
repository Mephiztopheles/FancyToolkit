import {Criteria, Query} from "../../Criteria/Criteria.js";
import Table from "../../Table/Table.js";
import { AbstractTableModel } from "../../Table/AbstractTableModel.js";
import AbstractTableRenderer from "../../Table/AbstractTableRenderer.js";

var object1  = { id: 1, name: "Kalvin Klein", active: true },
	object2  = { id: 2, name: "Mario Gomez", active: true },
	object3  = { id: 3, name: "Martin Schulz", active: false },
	object4  = { id: 4, name: "Michael Meyer", active: true },
	object5  = { id: 5, name: "Sarah Pesh", active: false },
	object6  = { id: 6, name: "Stefan Brunkler", active: true },
	object7  = { id: 7, name: "Lars Volks", active: false },
	array    = [ object7, object3, object4, object1, object5, object2, object6 ],
	criteria = new Criteria( array );

criteria.query = new Query( `name:like("Sch")` );
criteria.query = new Query( `id:bt(0,10)` );
criteria.query = new Query( `SORT active:asc,name:desc` );


class TestTable extends Table {
}

class TestModel extends AbstractTableModel {
	
    getNameAt(index) {
		
        switch (index) {
            case 0:
                return "#";
            case 1:
                return "ID";
            case 2:
                return "Name";
            case 3:
                return "Aktiv";
        }
        return "";
    }
	
    getCellCount() {
        return 4;
    }
	
    getValueAt(row, cell, index) {

        const item = this.get(row);
        switch (cell) {
            case 0:
                return (index + 1);
            case 1:
                return item.id;
            case 2:
                return item.name;
            case 3:
                return item.active;
        }
        return "";
    }
}

class TestTableRenderer extends AbstractTableRenderer {
	
    getCellClass(cellIndex) {
		
        switch (cellIndex) {
            case 0:
                return "index";
            case 1:
                return "id";
            case 2:
                return "name";
        }
    }
}

const model = new TestModel(criteria.list());
const renderer = new TestTableRenderer();
const table = new TestTable(".table", model, renderer);
table.paint();

$(()=>{
	
	const form = $("form");
	const input = $("input");
	input.val(criteria.query.query);
	
	form.on("submit",e=>{
		
		e.preventDefault();
		criteria.query = new Query( input.val() );
		model.setItems(criteria.list());
		table.dataChanged();
		console.log(criteria);
	});
	
});
