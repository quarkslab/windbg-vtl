// Salma El Mohib - 07-July-2021
//  Hyper-v 19041.21 debug script
//
// Example:
//   ****   List exisiting partitions  ****
//   * from the debugger:
//    1: kd> dx -r1 @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()
//      @$scripts.hv.Contents.hvExtension.HvInternals.getPartitions()                 : [object Generator]
//          [0x0]            : _HV_PARTITION *[0xffffe80000001000]
//          [0x1]            : _HV_PARTITION *[0xffffe80200001000]
//


"use script"; 

const logln = p => host.diagnostics.debugLog(p + '\n') 

let readValue = function(addr, size) {   
	try   {     
		let val = host.memory.readMemoryValues(addr, 1, size)[0];     
		return val;   
	} 
	catch(e)   
	{     return -1;   } 
}

let readPhys64 = function(addr) {
    try{    
		let control = host.namespace.Debugger.Utility.Control;
        for(let Line of control.ExecuteCommand('dq /p '.concat(addr))){
            val = String(Line.split(" ")[2].trim().replace("`",""));
			return host.parseInt64(val, 16); 
        }
    }
	catch(e){
		return -1;
	}
}
 
let formatU64 = function(Addr) {       
	return '0x' + Addr.toString(16).padStart(16, '0'); 
} 

class _HV_PARTITION {   
	constructor(partition_addr) {     
		this.__partition_addr = partition_addr;
		this.__vp_offset = 0x158;
	}   
	
	get PartitionProperty() {     
		return readValue(this.__partition_addr.add(0x128), 8);   
	}   
	
	get VirtualProcessorCount() {     
		return readValue(this.__partition_addr.add(0x148), 4);   
	}   
	
	get VirtualProcessorList() {     
		class HvVpArray     {       
			constructor(ArrayBaseAddress, VpCount) { 	
				this.__arrayBaseAddress = ArrayBaseAddress; 	
				this.__vp_count = VpCount;       
			}       
			
			*[Symbol.iterator](){ 	
				let vp_ptr = this.__arrayBaseAddress;		
				for(let i=0; i < this.__vp_count; ++i) 	{					
					const vp = new _HV_VP(readValue(vp_ptr, 8)); 	  
					yield vp; 	  
					vp_ptr = vp_ptr.add(8);
				}       
			}       
			
			toString(){ 	
				return `Array of _HV_VP`       
			}     
		}     
		return new HvVpArray(this.__partition_addr.add(this.__vp_offset) , this.VirtualProcessorCount);   
	}   
	 
	toString() {     
		return `_HV_PARTITION *[${this.__partition_addr}]`   
	} 
} 

class _HV_VP {   
	constructor(vp_addr) {     
		this.__vp_addr = vp_addr;     
		this.__vtl_number = 2;
		this.__vtl_offset = 0x180;
	}   
	
	get VtlList() {    
		class HvVtlArray     {       
			constructor(ArrayBaseAddress, VtlCount) { 	
				this.__arrayBaseAddress = ArrayBaseAddress; 	
				this.__vtl_count = VtlCount;       
			}       
			
			*[Symbol.iterator](){ 	
				let vtl_ptr = this.__arrayBaseAddress; 	
				for(let i=0; i < 2; ++i) 	{ 	  
					const vtl = new _HV_VTL(readValue(vtl_ptr, 8)); 	  
					yield vtl; 	  
					vtl_ptr = vtl_ptr.add(0x8); 	
				}       
			}
       		
			toString(){ 	
				return `Array of _HV_VTL`       
			}        
		}     
		return new HvVtlArray(this.__vp_addr.add(this.__vtl_offset), this.__vtl_count);   
	}
	toString(){     
		return `_HV_VP * [${this.__vp_addr}]`;   
	} 	
} 

class _HV_VTL {
	constructor(vtl_addr) {     
		this.__vtl_addr = vtl_addr;
		this.__vmcs_offset = 0xe90;
	}   
	
	get VmcsProperties() {       
		return new _HV_VMCS_PROPS(readValue(this.__vtl_addr.add(this.__vmcs_offset), 8)) 
	}   
	
	toString(){     
		return `_HV_VTL * [${this.__vtl_addr}]`;   
	} 
}

class _HV_VMCS_PROPS{
	constructor(vmcs_props_address){
		this.__vmcs_props_addr = vmcs_props_address;
		this.__vmcs_virt_off = 0x180;
		this.__vmcs_phys_off = 0x188;
	}
	
	get VmcsAddress(){
		this.__vmcs_phys_addr = readValue(this.__vmcs_props_addr.add(this.__vmcs_phys_off), 8);
		this.__vmcs_virt_addr = readValue(this.__vmcs_props_addr.add(this.__vmcs_virt_off), 8);
		return [this.__vmcs_virt_addr, this.__vmcs_phys_addr];
	}
	
	toString(){
		return `_HV_VMCS_PROPS * [${this.__vmcs_props_addr}]`;
	}	
}

class HvInternals {   
	*getPartitions()   {     
		const max_partition_number = 0x40;
		let partition_root = host.Int64(0xFFFFE80000001000);   
		for(let i=0; i < max_partition_number; ++i){       
			if(readValue(partition_root, 4) != -1){ 	
				yield new _HV_PARTITION(partition_root);
			}       
			partition_root = partition_root.add(0x100000000);
		}  
	} 
} 

var hvExtension =   {     
	get HvInternals() { return new HvInternals (this); },   
} 

function initializeScript() {   
	return [new host.namedModelParent(hvExtension, "Debugger.Models.Utility"), 
			new host.typeSignatureRegistration(_HV_PARTITION, "_HV_PARTITION"), 
			new host.typeSignatureRegistration(_HV_VP, "_HV_VP", "hv"), 
			new host.typeSignatureRegistration(_HV_VTL, "_HV_VTL", "hv"), 
			new host.typeSignatureRegistration(_HV_VMCS_PROPS, "_HV_VMCS_PROPS", "hv"), 
			]; 
}

