Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'iteration',
    comboboxConfig: {
        fieldLabel: 'Select iteration:',
        labelWidth: 100,
        width: 300
    },
    onScopeChange: function() {
        Ext.create('Rally.data.wsapi.Store',{
	    model: 'User Story',
	    fetch: ['FormattedID','Name','PlanEstimate'],  
	    limit: Infinity,
	    autoLoad: true,
	    filters: [this.getContext().getTimeboxScope().getQueryFilter()],
	    sorters: [
		{
		property: 'DragAndDropRank',
		direction: 'DESC'
		}
	    ],
	    listeners: {
		load: this._onStoriesLoaded,
		scope: this
	    }
	});
    },
    _onStoriesLoaded: function(store,records){
        var myData = [];
        //in case we want to track them separately:
        //var estimatedStories = []; 
        //var unestimatedStories = [];
	console.log(records.length);
        var estimated = false;
        _.each(records, function(record){
            //if (record.get('PlanEstimate')) {
            //    estimatedStories.push(record);
            //}
            //else{
            //    unestimatedStories.push(record);
            //}
            estimated = record.get('PlanEstimate') ? true : false;
            console.log(estimated);
            var obj = Ext.apply(record.getData(),{
                isEstimated: estimated
            });
            myData.push(obj);
        },this);
        //console.log(estimatedStories.length, unestimatedStories.length);
        this._makeGrid(myData);
    },
    _makeGrid:function(myData){
        if(this.down('#storyGrid')){
            this.down('#storyGrid').destroy();
        }
        var gridStore = Ext.create('Rally.data.custom.Store', {
	  data: myData,
	  limit:Infinity,
          groupField: 'isEstimated'
        });
        this.add({
            xtype: 'rallygrid',
            itemId: 'storyGrid',
            store: gridStore,
            showRowActionsColumn: false,
            width: 400,
            features: [
                {
                    ftype:'grouping',
                    groupHeaderTpl: 'Estimated: {name} ({rows.length} {[values.rows.length > 1 ? "Stories" : "Story"]})'
                }
            ],
            columnCfgs:[
                {
                    xtype: 'templatecolumn',
                    text: 'ID',
                    dataIndex: 'FormattedID',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                  text: 'Name', dataIndex: 'Name'
                },
                {
                  text: 'PlanEstimate', dataIndex: 'PlanEstimate'
                }
            ]
        });
    }
    
});